import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scanQueue } from "@/lib/queue";
import { env } from "@/lib/env";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.watchlist.findMany({
    where: {
      active: true,
      nextRunAt: { lte: now },
    },
    orderBy: { nextRunAt: "asc" },
  });

  console.log(`[cron] run-due-watchlists: ${due.length} watchlist(s) due at ${now.toISOString()}`);

  const enqueued: Array<{ watchlistId: string; scanId: string }> = [];

  for (const w of due) {
    const scan = await prisma.scan.create({
      data: {
        userId: w.userId,
        watchlistId: w.id,
        query: w.query,
        location: w.location,
        userPrice: w.userPrice,
        marketplaces: w.marketplaces,
        status: "PENDING",
      },
    });

    await scanQueue.add("scan", {
      scanId: scan.id,
      query: scan.query,
      location: scan.location ?? undefined,
      userPrice: scan.userPrice ?? undefined,
      marketplaces: w.marketplaces,
      watchlistId: w.id,
    });

    await prisma.watchlist.update({
      where: { id: w.id },
      data: {
        lastRunAt: now,
        nextRunAt: new Date(now.getTime() + WEEK_MS),
      },
    });

    enqueued.push({ watchlistId: w.id, scanId: scan.id });
    console.log(`[cron] enqueued scan ${scan.id} for watchlist ${w.id} (${w.query})`);
  }

  return NextResponse.json({ enqueued: enqueued.length, scans: enqueued });
}

export const GET = handle;
export const POST = handle;
