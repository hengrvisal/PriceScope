import { formatCents, marketplaceLabel } from "@/lib/format";

type PlatformStats = {
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
};

export function MarketplaceBreakdown({
  breakdown,
}: {
  breakdown: Record<string, PlatformStats>;
}) {
  const rows = Object.entries(breakdown);
  if (rows.length === 0)
    return <p className="text-sm text-gray-500">No marketplace data.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Marketplace</th>
          <th className="py-2 text-right">Count</th>
          <th className="py-2 text-right">Average</th>
          <th className="py-2 text-right">Min</th>
          <th className="py-2 text-right">Max</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([marketplace, s]) => (
          <tr key={marketplace} className="border-b">
            <td className="py-2">{marketplaceLabel(marketplace)}</td>
            <td className="py-2 text-right">{s.count}</td>
            <td className="py-2 text-right">{formatCents(s.avgPrice)}</td>
            <td className="py-2 text-right">{formatCents(s.minPrice)}</td>
            <td className="py-2 text-right">{formatCents(s.maxPrice)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
