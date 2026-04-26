import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/watchlist-token";

export const dynamic = "force-dynamic";

async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return htmlResponse("Missing token.", 400);
  }

  const verifiedId = verifyUnsubscribeToken(token);
  if (!verifiedId || verifiedId !== id) {
    return htmlResponse("This unsubscribe link is invalid or has expired.", 400);
  }

  const result = await prisma.watchlist.updateMany({
    where: { id, active: true },
    data: { active: false },
  });

  console.log(
    `[api] watchlist ${id} unsubscribe: ${result.count > 0 ? "deactivated" : "already inactive or not found"}`
  );

  return htmlResponse(
    "You're unsubscribed. This watchlist has been paused — no further alerts will be sent. You can re-enable it from the dashboard.",
    200
  );
}

export const GET = handle;
export const POST = handle;

function htmlResponse(message: string, status: number): NextResponse {
  const body = `<!doctype html>
<html><head><meta charset="utf-8"><title>PriceScope unsubscribe</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head><body style="font-family:system-ui,sans-serif;max-width:520px;margin:60px auto;padding:0 20px;color:#111;line-height:1.6">
<h1 style="font-size:20px;margin:0 0 16px">PriceScope</h1>
<p>${escapeHtml(message)}</p>
</body></html>`;
  return new NextResponse(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
