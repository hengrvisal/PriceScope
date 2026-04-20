import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: { report: true },
  });

  if (!scan || scan.userId !== session.user.id) {
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
    watchlistId: scan.watchlistId,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    report: scan.report,
    listings,
  });
}
