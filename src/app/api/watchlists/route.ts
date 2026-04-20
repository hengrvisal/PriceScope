import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Marketplace } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const createWatchlistSchema = z.object({
  query: z.string().min(1).max(200),
  location: z.string().max(100).optional(),
  userPrice: z.number().int().nonnegative().optional(),
  marketplaces: z.array(z.nativeEnum(Marketplace)).min(1),
  seedScanId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createWatchlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const nextRunAt = new Date(Date.now() + WEEK_MS);

  const watchlist = await prisma.watchlist.create({
    data: {
      userId: session.user.id,
      query: parsed.data.query,
      location: parsed.data.location,
      userPrice: parsed.data.userPrice,
      marketplaces: parsed.data.marketplaces,
      frequency: "WEEKLY",
      active: true,
      nextRunAt,
    },
  });

  // Link the originating scan (if provided and owned by this user) to the
  // new watchlist so the first cron-triggered scan 7 days from now has a
  // baseline median to compare against.
  if (parsed.data.seedScanId) {
    await prisma.scan.updateMany({
      where: {
        id: parsed.data.seedScanId,
        userId: session.user.id,
        watchlistId: null,
      },
      data: { watchlistId: watchlist.id },
    });
  }

  console.log(`[api] watchlist ${watchlist.id} created for user ${session.user.id}`);

  return NextResponse.json(
    { watchlistId: watchlist.id, nextRunAt: watchlist.nextRunAt.toISOString() },
    { status: 201 }
  );
}
