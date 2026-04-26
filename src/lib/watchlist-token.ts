import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

function getSecret(): string {
  if (!env.WATCHLIST_UNSUBSCRIBE_SECRET) {
    throw new Error("WATCHLIST_UNSUBSCRIBE_SECRET is not configured");
  }
  return env.WATCHLIST_UNSUBSCRIBE_SECRET;
}

function base64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function signUnsubscribeToken(watchlistId: string): string {
  const secret = getSecret();
  const payload = base64Url(Buffer.from(watchlistId, "utf8"));
  const sig = createHmac("sha256", secret).update(payload).digest();
  return `${payload}.${base64Url(sig)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (!env.WATCHLIST_UNSUBSCRIBE_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, providedSig] = parts;
  const expectedSig = createHmac("sha256", env.WATCHLIST_UNSUBSCRIBE_SECRET)
    .update(payload)
    .digest();

  let providedBuf: Buffer;
  try {
    providedBuf = Buffer.from(providedSig, "base64url");
  } catch {
    return null;
  }

  if (providedBuf.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedBuf, expectedSig)) return null;

  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function buildUnsubscribeUrl(watchlistId: string, appUrl: string): string {
  const token = signUnsubscribeToken(watchlistId);
  return `${appUrl}/api/watchlists/${watchlistId}/unsubscribe?token=${encodeURIComponent(token)}`;
}
