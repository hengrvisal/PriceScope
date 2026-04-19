import { formatCents } from "@/lib/format";

type Report = {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  pricePosition: number | null;
  recommendation: { message?: string } | null;
};

export function PriceReport({ report }: { report: Report }) {
  const stats = [
    { label: "Listings", value: String(report.totalListings) },
    { label: "Average", value: formatCents(report.avgPrice) },
    { label: "Median", value: formatCents(report.medianPrice) },
    { label: "Min", value: formatCents(report.minPrice) },
    { label: "Max", value: formatCents(report.maxPrice) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="border rounded p-3">
            <div className="text-xs uppercase text-gray-500">{s.label}</div>
            <div className="text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      {report.pricePosition !== null && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="text-xs uppercase text-gray-500">Your price position</div>
          <div className="text-sm">
            {Math.round(report.pricePosition * 100)}th percentile
          </div>
          {report.recommendation?.message && (
            <div className="text-sm mt-1">{report.recommendation.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
