import { formatCents } from "@/lib/format";

type Report = {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
};

export function PriceReport({ report }: { report: Report }) {
  const stats = [
    { label: "Listings", value: String(report.totalListings) },
    { label: "Median", value: formatCents(report.medianPrice) },
    { label: "Average", value: formatCents(report.avgPrice) },
    { label: "Min", value: formatCents(report.minPrice) },
    { label: "Max", value: formatCents(report.maxPrice) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="border rounded-lg p-4 bg-white">
          <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
          <div className="text-2xl font-semibold mt-1 text-gray-900">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
