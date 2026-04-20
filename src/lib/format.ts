export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const MARKETPLACE_LABEL: Record<string, string> = {
  EBAY_AU: "eBay AU",
  GUMTREE: "Gumtree",
  FACEBOOK: "Facebook",
  AMAZON_AU: "Amazon AU",
};

export function marketplaceLabel(marketplace: string): string {
  return MARKETPLACE_LABEL[marketplace] ?? marketplace;
}
