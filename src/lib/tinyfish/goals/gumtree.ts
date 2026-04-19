export const marketplace = "GUMTREE" as const;

export const defaultOptions = {
  browser_profile: "stealth",
  proxy_config: { enabled: true, type: "tetra" },
} as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildUrl(query: string, location?: string): string {
  const loc = location ? encodeURIComponent(location.toLowerCase()) : "australia";
  return `https://www.gumtree.com.au/s-${loc}/${slugify(query)}/k0`;
}

export function buildGoal(query: string, _category?: string, location?: string): string {
  const loc = location ? ` in ${location}` : " in Australia";
  return `Search Gumtree${loc} for "${query}". Extract the first 15 listings on the search results page. For each listing, extract:
- title: listing title (string)
- price: numeric price in AUD, no currency symbol (number; use 0 if "Free", null if "Please Contact")
- location: suburb or city of the listing (string)
- listingAge: age text as shown, e.g. "2 days ago", "1 hour ago" (string)
- url: full absolute listing URL

Return ONLY a JSON array with this exact shape, no prose:
[{"title": string, "price": number|null, "location": string, "listingAge": string, "url": string}]`;
}
