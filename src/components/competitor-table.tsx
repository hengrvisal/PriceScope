import { formatCents } from "@/lib/format";

type Listing = {
  id: string;
  marketplace: string;
  title: string;
  price: number;
  condition: string | null;
  listingUrl: string;
  matchType: string;
  matchConfidence: number;
};

export function CompetitorTable({ listings }: { listings: Listing[] }) {
  if (listings.length === 0)
    return <p className="text-sm text-gray-500">No listings.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Title</th>
            <th className="py-2">Marketplace</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2">Condition</th>
            <th className="py-2">Match</th>
            <th className="py-2 text-right">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b align-top">
              <td className="py-2 pr-3 max-w-md">
                <a
                  href={l.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {l.title}
                </a>
              </td>
              <td className="py-2 pr-3">{l.marketplace}</td>
              <td className="py-2 pr-3 text-right">{formatCents(l.price)}</td>
              <td className="py-2 pr-3">{l.condition ?? "—"}</td>
              <td className="py-2 pr-3">{l.matchType}</td>
              <td className="py-2 text-right">
                {l.matchConfidence.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
