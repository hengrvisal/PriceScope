export const marketplace = "AMAZON_AU" as const;

export const defaultOptions = {} as const;

export function buildUrl(query: string, _location?: string): string {
  return `https://www.amazon.com.au/s?k=${encodeURIComponent(query)}`;
}

export function buildGoal(query: string, _category?: string, _location?: string): string {
  return `Search Amazon Australia for "${query}". Extract the first 15 product results shown on the search results page. For each product, extract:
- title: product title (string)
- price: numeric price in AUD, no currency symbol (number)
- rating: average star rating 0-5 (number, null if not shown)
- reviewCount: total number of reviews (number, null if not shown)
- primeEligible: true if Prime badge shown, false otherwise (boolean)
- url: full absolute product URL

Return ONLY a JSON array with this exact shape, no prose:
[{"title": string, "price": number, "rating": number|null, "reviewCount": number|null, "primeEligible": boolean, "url": string}]`;
}
