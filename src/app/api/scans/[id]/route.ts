import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const scan = await prisma.scan.findUnique({
    where: { id: params.id },
    include: { report: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (scan.status !== "COMPLETED") {
    return NextResponse.json({
      scanId: scan.id,
      status: scan.status,
      errorMessage: scan.errorMessage,
    });
  }

  const listings = await prisma.listing.findMany({
    where: { scanId: scan.id },
    orderBy: { matchConfidence: "desc" },
  });

  return NextResponse.json({
    scanId: scan.id,
    status: scan.status,
    query: scan.query,
    category: scan.category,
    location: scan.location,
    userPrice: scan.userPrice,
    marketplaces: scan.marketplaces,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    report: scan.report,
    listings,
  });
}
