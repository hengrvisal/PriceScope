import { z } from "zod";
import type { Marketplace } from "@prisma/client";

const ebaySchema = z.object({
  title: z.string(),
  price: z.number().nullable(),
  condition: z.string().nullable().optional(),
  listingType: z.string().nullable().optional(),
  shippingCost: z.number().nullable().optional(),
  url: z.string(),
});

const gumtreeSchema = z.object({
  title: z.string(),
  price: z.number().nullable(),
  location: z.string().nullable().optional(),
  listingAge: z.string().nullable().optional(),
  url: z.string(),
});

const facebookSchema = z.object({
  title: z.string(),
  price: z.number().nullable(),
  location: z.string().nullable().optional(),
  url: z.string(),
});

const amazonSchema = z.object({
  title: z.string(),
  price: z.number().nullable(),
  rating: z.number().nullable().optional(),
  reviewCount: z.number().nullable().optional(),
  primeEligible: z.boolean().optional(),
  url: z.string(),
});

export type NormalizedListing = {
  title: string;
  price: number; // cents
  currency: string;
  condition?: string | null;
  location?: string | null;
  listingUrl: string;
  rawData: Record<string, unknown>;
};

const SCHEMAS: Record<Marketplace, z.ZodSchema<any>> = {
  EBAY_AU: ebaySchema,
  GUMTREE: gumtreeSchema,
  FACEBOOK: facebookSchema,
  AMAZON_AU: amazonSchema,
};

function toCents(price: number | null | undefined): number | null {
  if (price === null || price === undefined || Number.isNaN(price)) return null;
  return Math.round(price * 100);
}

export function parseListings(
  marketplace: Marketplace,
  raw: unknown
): NormalizedListing[] {
  let arr: unknown = raw;

  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      console.warn(`[parser] ${marketplace} resultJson is unparseable string:`, raw);
      return [];
    }
  }

  if (!Array.isArray(arr)) {
    if (arr && typeof arr === "object") {
      const maybe = (arr as any).listings ?? (arr as any).results ?? (arr as any).data;
      if (Array.isArray(maybe)) arr = maybe;
    }
  }

  if (!Array.isArray(arr)) {
    console.warn(`[parser] ${marketplace} resultJson is not an array:`, JSON.stringify(raw).slice(0, 300));
    return [];
  }

  const schema = SCHEMAS[marketplace];
  const out: NormalizedListing[] = [];
  for (const item of arr) {
    const parsed = schema.safeParse(item);
    if (!parsed.success) {
      console.warn(`[parser] ${marketplace} listing failed validation:`, parsed.error.issues);
      continue;
    }
    const cents = toCents(parsed.data.price);
    if (cents === null) {
      console.warn(`[parser] ${marketplace} listing skipped (no price):`, parsed.data.title);
      continue;
    }
    out.push({
      title: parsed.data.title,
      price: cents,
      currency: "AUD",
      condition: (parsed.data as any).condition ?? null,
      location: (parsed.data as any).location ?? null,
      listingUrl: parsed.data.url,
      rawData: parsed.data,
    });
  }

  console.log(`[parser] ${marketplace}: ${out.length}/${arr.length} listings validated`);

  if (marketplace === "EBAY_AU") {
    const seen = new Set<string>();
    const deduped: NormalizedListing[] = [];
    for (const listing of out) {
      const match = listing.listingUrl.match(/\/itm\/(\d+)/);
      const itemId = match ? match[1] : null;
      if (itemId && seen.has(itemId)) continue;
      if (itemId) seen.add(itemId);
      deduped.push(listing);
    }
    const removed = out.length - deduped.length;
    console.log(`[parser] EBAY_AU: removed ${removed} duplicate listings by item ID`);
    return deduped;
  }

  return out;
}
