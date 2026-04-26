import { Worker, Job } from "bullmq";
import type { Marketplace } from "@prisma/client";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { SCAN_QUEUE, type ScanJobData } from "../lib/queue";
import { runTinyFishAutomation, TinyFishError, TinyFishAgentFailedError } from "../lib/tinyfish/client";
import { parseListings, type NormalizedListing } from "../lib/tinyfish/parser";
import { matchListings, type MatchedListing } from "../lib/matching/product-matcher";
import { computePriceStats } from "../lib/analysis/price-stats";
import { recordAlertIfShifted } from "../lib/alerts/evaluate";

import * as ebay from "../lib/tinyfish/goals/ebay";
import * as gumtree from "../lib/tinyfish/goals/gumtree";
import * as facebook from "../lib/tinyfish/goals/facebook";
import * as amazon from "../lib/tinyfish/goals/amazon";

const GOAL_BUILDERS = {
  EBAY_AU: ebay,
  GUMTREE: gumtree,
  FACEBOOK: facebook,
  AMAZON_AU: amazon,
} as const;

type ExtractResult = {
  marketplace: Marketplace;
  listings: NormalizedListing[];
  durationMs: number;
  error?: string;
};

async function extractOne(
  marketplace: Marketplace,
  query: string,
  category: string | undefined,
  location: string | undefined
): Promise<ExtractResult> {
  const builder = GOAL_BUILDERS[marketplace];
  const url = builder.buildUrl(query, location);
  const goal = builder.buildGoal(query, category, location);
  const opts = { url, goal, ...builder.defaultOptions };
  const startedAt = Date.now();

  try {
    const raw = await runTinyFishAutomation(opts);
    const listings = parseListings(marketplace, raw);
    return { marketplace, listings, durationMs: Date.now() - startedAt };
  } catch (err) {
    if (err instanceof TinyFishAgentFailedError) {
      console.error(`[worker] ${marketplace} agent reported failure: ${err.reason} — ${err.details}`);
    }
    const msg = err instanceof TinyFishError ? err.message : (err as Error).message;
    console.error(`[worker] ${marketplace} failed (first try): ${msg}`);

    // Retry once with stealth profile
    try {
      const raw = await runTinyFishAutomation({ ...opts, browser_profile: "stealth" });
      const listings = parseListings(marketplace, raw);
      console.log(`[worker] ${marketplace} recovered on retry`);
      return { marketplace, listings, durationMs: Date.now() - startedAt };
    } catch (err2) {
      if (err2 instanceof TinyFishAgentFailedError) {
        console.error(`[worker] ${marketplace} agent reported failure (retry): ${err2.reason} — ${err2.details}`);
      }
      const msg2 = err2 instanceof TinyFishError ? err2.message : (err2 as Error).message;
      console.error(`[worker] ${marketplace} failed (retry): ${msg2}`);
      return {
        marketplace,
        listings: [],
        durationMs: Date.now() - startedAt,
        error: msg2,
      };
    }
  }
}

export async function runScanPipeline(data: ScanJobData): Promise<void> {
  const { scanId, query, category, location, userPrice, marketplaces, watchlistId } = data;
  const overallStart = Date.now();

  console.log(`[worker] scan ${scanId} starting: "${query}" across ${marketplaces.join(",")}`);

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "RUNNING" },
  });

  const extractResults = await Promise.allSettled(
    marketplaces.map((m) => extractOne(m, query, category, location))
  );

  const perMarketplace: ExtractResult[] = extractResults.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      marketplace: marketplaces[i],
      listings: [],
      durationMs: 0,
      error: (r.reason as Error)?.message ?? "unknown",
    };
  });

  for (const r of perMarketplace) {
    console.log(
      `[worker] ${r.marketplace}: ${r.listings.length} listings in ${r.durationMs}ms${r.error ? ` (error: ${r.error})` : ""}`
    );
  }

  const allListings: Array<NormalizedListing & { marketplace: Marketplace }> = [];
  for (const r of perMarketplace) {
    for (const l of r.listings) allListings.push({ ...l, marketplace: r.marketplace });
  }

  const allFailed = perMarketplace.every((r) => r.listings.length === 0);
  if (allFailed) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        errorMessage: perMarketplace.map((r) => `${r.marketplace}: ${r.error ?? "no listings"}`).join("; "),
        completedAt: new Date(),
      },
    });
    console.error(`[worker] scan ${scanId} FAILED — no marketplaces returned listings`);
    return;
  }

  const matchStart = Date.now();
  const matched = await matchListings(query, allListings, userPrice);
  console.log(`[worker] matching complete: ${matched.length} listings in ${Date.now() - matchStart}ms`);

  const matchedWithMarket: Array<MatchedListing & { marketplace: Marketplace }> = matched.map(
    (m, i) => ({ ...m, marketplace: allListings[i].marketplace })
  );

  if (matchedWithMarket.length > 0) {
    await prisma.listing.createMany({
      data: matchedWithMarket.map((l) => ({
        scanId,
        marketplace: l.marketplace,
        title: l.title,
        price: l.price,
        currency: l.currency,
        condition: l.condition ?? null,
        location: l.location ?? null,
        listingUrl: l.listingUrl,
        matchType: l.matchType,
        matchConfidence: l.matchConfidence,
        rawData: l.rawData as object,
      })),
    });
  }

  const stats = computePriceStats(matchedWithMarket, userPrice);

  if (stats.count > 0) {
    await prisma.scanReport.create({
      data: {
        scanId,
        avgPrice: stats.mean,
        medianPrice: stats.median,
        minPrice: stats.min,
        maxPrice: stats.max,
        totalListings: stats.count,
        platformBreakdown: stats.platformBreakdown as object,
        pricePosition: stats.userPricePercentile ?? null,
        recommendation: stats.positionMessage
          ? { message: stats.positionMessage }
          : undefined,
      },
    });
  }

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  console.log(
    `[worker] scan ${scanId} COMPLETED in ${Date.now() - overallStart}ms (${matchedWithMarket.length} listings, ${stats.count} in report)`
  );

  if (watchlistId && stats.count > 0) {
    try {
      const { created, evaluation } = await recordAlertIfShifted(watchlistId, scanId);
      if (created && evaluation.kind === "shift") {
        console.log(
          `[worker] alert created for watchlist ${watchlistId}: ${evaluation.message}`
        );
      } else {
        console.log(
          `[worker] no alert for watchlist ${watchlistId}: ${evaluation.kind}`
        );
      }
    } catch (err) {
      console.error(`[worker] alert evaluation failed for watchlist ${watchlistId}:`, err);
    }
  }
}

export function startScanWorker(): Worker<ScanJobData> {
  const worker = new Worker<ScanJobData>(
    SCAN_QUEUE,
    async (job: Job<ScanJobData>) => {
      await runScanPipeline(job.data);
    },
    { connection: redis, concurrency: 2 }
  );

  worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err);
  });

  worker.on("completed", (job) => {
    console.log(`[worker] job ${job.id} completed`);
  });

  console.log(`[worker] scan-worker started, listening on ${SCAN_QUEUE}`);
  return worker;
}
