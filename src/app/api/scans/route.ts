import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Marketplace } from "@prisma/client";
import { prisma } from "@/lib/db";
import { scanQueue } from "@/lib/queue";

const createScanSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  userPrice: z.number().int().nonnegative().optional(),
  marketplaces: z
    .array(z.nativeEnum(Marketplace))
    .min(1)
    .optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const marketplaces = parsed.data.marketplaces ?? [Marketplace.EBAY_AU];

  const scan = await prisma.scan.create({
    data: {
      query: parsed.data.query,
      category: parsed.data.category,
      location: parsed.data.location,
      userPrice: parsed.data.userPrice,
      marketplaces,
      status: "PENDING",
    },
  });

  await scanQueue.add("scan", {
    scanId: scan.id,
    query: scan.query,
    category: scan.category ?? undefined,
    location: scan.location ?? undefined,
    userPrice: scan.userPrice ?? undefined,
    marketplaces,
  });

  console.log(`[api] scan ${scan.id} enqueued`);

  return NextResponse.json({ scanId: scan.id, status: scan.status }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "10", 10)));

  const [total, scans] = await Promise.all([
    prisma.scan.count(),
    prisma.scan.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ page, limit, total, scans });
}
