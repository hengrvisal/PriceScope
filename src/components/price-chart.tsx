"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCents } from "@/lib/format";

type Listing = { price: number };

const BIN_COUNT = 10;

type Bin = { lo: number; hi: number; range: string; count: number };

function bin(listings: Listing[]): Bin[] {
  if (listings.length === 0) return [];
  const prices = listings.map((l) => l.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return [{ lo: min, hi: min, range: formatCents(min), count: listings.length }];

  const step = (max - min) / BIN_COUNT;
  const bins: Bin[] = Array.from({ length: BIN_COUNT }, (_, i) => {
    const lo = min + step * i;
    const hi = min + step * (i + 1);
    return {
      lo,
      hi,
      range: `${formatCents(Math.round(lo))}–${formatCents(Math.round(hi))}`,
      count: 0,
    };
  });
  for (const p of prices) {
    const idx = Math.min(BIN_COUNT - 1, Math.floor((p - min) / step));
    bins[idx].count += 1;
  }
  return bins;
}

export function PriceChart({
  listings,
  userPrice,
}: {
  listings: Listing[];
  userPrice?: number;
}) {
  const data = bin(listings);
  if (data.length === 0) return <p className="text-sm text-gray-500">No price data.</p>;

  const userBin =
    typeof userPrice === "number"
      ? data.find((b) => userPrice >= b.lo && userPrice <= b.hi) ?? null
      : null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={0}>
        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#111827" />
          {userBin && typeof userPrice === "number" && (
            <ReferenceLine
              x={userBin.range}
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="4 2"
              ifOverflow="extendDomain"
            >
              <Label
                value={`Your price: ${formatCents(userPrice)}`}
                position="top"
                fill="#dc2626"
                fontSize={11}
              />
            </ReferenceLine>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
