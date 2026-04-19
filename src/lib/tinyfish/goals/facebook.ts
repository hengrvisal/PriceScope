export const marketplace = "FACEBOOK" as const;

export const defaultOptions = {
  browser_profile: "stealth",
  proxy_config: { type: "residential", country: "AU" },
} as const;

export function buildUrl(query: string, location?: string): string {
  const loc = location ? encodeURIComponent(location.toLowerCase()) : "sydney";
  return `https://www.facebook.com/marketplace/${loc}/search?query=${encodeURIComponent(query)}`;
}

export function buildGoal(query: string, _category?: string, location?: string): string {
  const loc = location ? ` in ${location}` : "";
  return `Search Facebook Marketplace${loc} for "${query}". Scroll down once to ensure listings are loaded, then extract the first 15 listings visible. For each listing, extract:
- title: listing title (string)
- price: numeric price in AUD, no currency symbol (number; use 0 if "Free")
- location: city or suburb of the listing (string)
- url: full absolute listing URL

Return ONLY a JSON array with this exact shape, no prose:
[{"title": string, "price": number|null, "location": string, "url": string}]`;
}
