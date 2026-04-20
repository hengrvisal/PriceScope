export const marketplace = "FACEBOOK" as const;

export const defaultOptions = {
  browser_profile: "stealth",
  proxy_config: { enabled: true, type: "tetra" },
} as const;

export function buildUrl(query: string, location?: string): string {
  const loc = location ? encodeURIComponent(location.toLowerCase()) : "sydney";
  return `https://www.facebook.com/marketplace/${loc}/search?query=${encodeURIComponent(query)}`;
}

export function buildGoal(query: string, _category?: string, location?: string): string {
  const loc = location ? ` in ${location}` : "";
  return `Search Facebook Marketplace${loc} for "${query}". Extract the first 15 listings visible on the public search results page.

Hard constraints — follow these exactly:
- Extract ONLY from the public search results page. Do NOT click into any individual listing.
- Do NOT log in. Do NOT enter any credentials. Do NOT create an account.
- If a login prompt, modal, or wall appears, scroll past it or dismiss it WITHOUT logging in. Return whatever is visible behind or above it.
- If a field isn't visible on the search result card, return null for that field — do NOT navigate elsewhere to fetch it.
- You may scroll the results page once to load more cards, but do not paginate or navigate away.

For each listing, extract:
- title: listing title (string)
- price: numeric price in AUD, no currency symbol (number; use 0 if "Free", null if "Check messages" or no price visible)
- location: suburb or city shown on the card (string, null if not visible)
- listingAge: age text as shown, e.g. "2 days ago", "1 hour ago" (string, null if not visible)
- url: full absolute listing URL

Return ONLY a JSON array with this exact shape, no prose:
[{"title": string, "price": number|null, "location": string|null, "listingAge": string|null, "url": string}]`;
}
