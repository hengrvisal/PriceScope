import type { Marketplace } from "@prisma/client";
import type { MatchedListing } from "../matching/product-matcher";

export type PlatformStats = {
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
};

export type PriceStats = {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  percentile25: number;
  percentile75: number;
  platformBreakdown: Partial<Record<Marketplace, PlatformStats>>;
  userPricePercentile?: number;
  positionMessage?: string;
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

function messageFor(pct: number): string {
  if (pct < 0.25)
    return "Priced very competitively — you may be leaving money on the table";
  if (pct < 0.5) return "Priced below average — competitive positioning";
  if (pct < 0.75)
    return "Priced above average — ensure your listing quality justifies the premium";
  return "Priced significantly above market — consider adjusting unless your item has unique value";
}

type ListingWithMarketplace = MatchedListing & { marketplace: Marketplace };

export function computePriceStats(
  listings: ListingWithMarketplace[],
  userPrice?: number
): PriceStats {
  const filtered = listings.filter((l) => l.matchConfidence >= 0.6);
  const prices = filtered.map((l) => l.price).sort((a, b) => a - b);

  if (prices.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      percentile25: 0,
      percentile75: 0,
      platformBreakdown: {},
    };
  }

  const sum = prices.reduce((a, b) => a + b, 0);
  const mean = Math.round(sum / prices.length);
  const variance =
    prices.reduce((acc, p) => acc + (p - mean) ** 2, 0) / prices.length;
  const stdDev = Math.round(Math.sqrt(variance));

  const platformBreakdown: Partial<Record<Marketplace, PlatformStats>> = {};
  for (const l of filtered) {
    const existing = platformBreakdown[l.marketplace];
    if (!existing) {
      platformBreakdown[l.marketplace] = {
        count: 1,
        avgPrice: l.price,
        minPrice: l.price,
        maxPrice: l.price,
      };
    } else {
      existing.count += 1;
      existing.avgPrice = Math.round(
        (existing.avgPrice * (existing.count - 1) + l.price) / existing.count
      );
      existing.minPrice = Math.min(existing.minPrice, l.price);
      existing.maxPrice = Math.max(existing.maxPrice, l.price);
    }
  }

  const stats: PriceStats = {
    count: prices.length,
    mean,
    median: percentile(prices, 0.5),
    min: prices[0],
    max: prices[prices.length - 1],
    stdDev,
    percentile25: percentile(prices, 0.25),
    percentile75: percentile(prices, 0.75),
    platformBreakdown,
  };

  if (userPrice !== undefined) {
    const below = prices.filter((p) => p < userPrice).length;
    const pct = below / prices.length;
    stats.userPricePercentile = pct;
    stats.positionMessage = messageFor(pct);
  }

  console.log(
    `[stats] count=${stats.count} mean=${stats.mean} median=${stats.median} min=${stats.min} max=${stats.max}`
  );

  return stats;
}
