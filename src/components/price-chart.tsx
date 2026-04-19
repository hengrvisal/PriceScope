"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCents } from "@/lib/format";

type Listing = { price: number };

const BIN_COUNT = 10;

function bin(listings: Listing[]): { range: string; count: number }[] {
  if (listings.length === 0) return [];
  const prices = listings.map((l) => l.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return [{ range: formatCents(min), count: listings.length }];

  const step = (max - min) / BIN_COUNT;
  const bins = Array.from({ length: BIN_COUNT }, (_, i) => ({
    lo: min + step * i,
    hi: min + step * (i + 1),
    count: 0,
  }));
  for (const p of prices) {
    const idx = Math.min(BIN_COUNT - 1, Math.floor((p - min) / step));
    bins[idx].count += 1;
  }
  return bins.map((b) => ({
    range: `${formatCents(Math.round(b.lo))}–${formatCents(Math.round(b.hi))}`,
    count: b.count,
  }));
}

export function PriceChart({ listings }: { listings: Listing[] }) {
  const data = bin(listings);
  if (data.length === 0) return <p className="text-sm text-gray-500">No price data.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#111827" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
