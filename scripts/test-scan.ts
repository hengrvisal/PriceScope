import { Marketplace } from "@prisma/client";
import { runTinyFishAutomation } from "../src/lib/tinyfish/client";
import { parseListings } from "../src/lib/tinyfish/parser";
import { matchListings } from "../src/lib/matching/product-matcher";
import { computePriceStats } from "../src/lib/analysis/price-stats";

import * as ebay from "../src/lib/tinyfish/goals/ebay";
import * as gumtree from "../src/lib/tinyfish/goals/gumtree";

const GOAL_BUILDERS = {
  EBAY_AU: ebay,
  GUMTREE: gumtree,
} as const;

const QUERY = "laptop 16gb ram";
const LOCATION = "melbourne";
const MARKETPLACES: Array<keyof typeof GOAL_BUILDERS> = ["EBAY_AU"];

async function main() {
  console.log(`\n=== test-scan: "${QUERY}" in ${LOCATION} ===\n`);

  const extractions = await Promise.allSettled(
    MARKETPLACES.map(async (m) => {
      const builder = GOAL_BUILDERS[m];
      const url = builder.buildUrl(QUERY, LOCATION);
      const goal = builder.buildGoal(QUERY, undefined, LOCATION);
      console.log(`\n--- ${m} ---\nURL: ${url}`);
      const raw = await runTinyFishAutomation({ url, goal, ...builder.defaultOptions });
      console.log(`[${m}] raw response:`, JSON.stringify(raw, null, 2).slice(0, 2000));
      const listings = parseListings(m as Marketplace, raw);
      return { marketplace: m as Marketplace, listings };
    })
  );

  const allListings: Array<any> = [];
  for (let i = 0; i < extractions.length; i++) {
    const r = extractions[i];
    const m = MARKETPLACES[i];
    if (r.status === "rejected") {
      console.error(`[${m}] extraction failed:`, r.reason);
      continue;
    }
    for (const l of r.value.listings) allListings.push({ ...l, marketplace: r.value.marketplace });
  }

  console.log(`\n=== total extracted listings: ${allListings.length} ===\n`);

  const matched = await matchListings(QUERY, allListings);
  const matchedWithMarket = matched.map((m, i) => ({ ...m, marketplace: allListings[i].marketplace }));

  console.log("\n=== matched listings ===");
  for (const l of matchedWithMarket) {
    console.log(
      `[${l.marketplace}] ${l.matchType} (${l.matchConfidence.toFixed(2)}) $${(l.price / 100).toFixed(2)} — ${l.title}`
    );
  }

  const stats = computePriceStats(matchedWithMarket);
  console.log("\n=== price report ===");
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .then(() => {
    console.log("\n=== done ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("test-scan failed:", err);
    process.exit(1);
  });
