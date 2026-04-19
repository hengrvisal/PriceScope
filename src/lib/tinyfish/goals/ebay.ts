export const marketplace = "EBAY_AU" as const;

export const defaultOptions = {
  browser_profile: "stealth",
} as const;

export function buildUrl(query: string, _location?: string): string {
  return `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(query)}`;
}

export function buildGoal(query: string, category?: string, _location?: string): string {
  const cat = category ? ` in the "${category}" category` : "";
  return `Search eBay Australia for "${query}"${cat}. Extract the first 15 listings visible on the search results page. For each listing, extract:
- title: listing title (string)
- price: numeric price in AUD, no currency symbol (number)
- condition: "New", "Used", "Refurbished", or null if not shown
- listingType: "auction", "buy_it_now", or "auction_bin"
- shippingCost: numeric shipping cost in AUD, 0 if free shipping, null if not shown
- url: full absolute listing URL

Return ONLY a JSON array with this exact shape, no prose:
[{"title": string, "price": number, "condition": string|null, "listingType": string, "shippingCost": number|null, "url": string}]`;
}
