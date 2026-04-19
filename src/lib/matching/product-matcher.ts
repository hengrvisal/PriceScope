import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../env";
import type { NormalizedListing } from "../tinyfish/parser";
import type { MatchType } from "@prisma/client";

const MODEL = "claude-sonnet-4-20250514";
const BATCH_SIZE = 12;

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export type MatchedListing = NormalizedListing & {
  matchType: MatchType;
  matchConfidence: number;
};

const matchEntrySchema = z.object({
  index: z.number().int(),
  match: z.enum(["exact", "close", "related", "unrelated"]),
  confidence: z.number().min(0).max(1),
});

const matchResponseSchema = z.array(matchEntrySchema);

const TYPE_MAP: Record<string, MatchType> = {
  exact: "EXACT",
  close: "CLOSE",
  related: "RELATED",
  unrelated: "UNRELATED",
};

function buildPrompt(
  query: string,
  userPrice: number | undefined,
  batch: NormalizedListing[]
): string {
  const priceLine =
    userPrice !== undefined ? `User's current price: $${(userPrice / 100).toFixed(2)} AUD\n` : "";
  const lines = batch
    .map((l, i) => `Listing ${i}: ${l.title} — $${(l.price / 100).toFixed(2)}`)
    .join("\n");
  return `User is looking for: "${query}"
${priceLine}
Classify each listing below as exact, close, related, or unrelated to the user's query, with confidence 0.0 to 1.0.

- exact: same product, same model/specs
- close: same product family, minor variant differences
- related: similar category but different product
- unrelated: not the product at all

${lines}

Respond with ONLY a JSON array, no prose:
[{"index": 0, "match": "exact", "confidence": 0.95}, ...]`;
}

async function matchBatch(
  query: string,
  userPrice: number | undefined,
  batch: NormalizedListing[]
): Promise<MatchedListing[]> {
  const prompt = buildPrompt(query, userPrice, batch);
  const startedAt = Date.now();

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = res.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response had no text content");
  }

  const match = textBlock.text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Claude response missing JSON array: ${textBlock.text.slice(0, 200)}`);

  const json = JSON.parse(match[0]);
  const validated = matchResponseSchema.parse(json);

  console.log(`[matcher] batch of ${batch.length} matched in ${Date.now() - startedAt}ms`);

  const out: MatchedListing[] = batch.map((listing, i) => {
    const entry = validated.find((e) => e.index === i);
    if (!entry) {
      return { ...listing, matchType: "UNRELATED", matchConfidence: 0 };
    }
    return {
      ...listing,
      matchType: TYPE_MAP[entry.match],
      matchConfidence: entry.confidence,
    };
  });

  return out;
}

export async function matchListings(
  query: string,
  listings: NormalizedListing[],
  userPrice?: number
): Promise<MatchedListing[]> {
  if (listings.length === 0) return [];

  const results: MatchedListing[] = [];
  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);
    try {
      const matched = await matchBatch(query, userPrice, batch);
      results.push(...matched);
    } catch (err) {
      console.error(`[matcher] batch ${i}-${i + batch.length} failed, falling back:`, err);
      for (const listing of batch) {
        results.push({ ...listing, matchType: "RELATED", matchConfidence: 0.5 });
      }
    }
  }
  return results;
}
