"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PriceReport } from "./price-report";
import { PriceChart } from "./price-chart";
import { MarketplaceBreakdown } from "./marketplace-breakdown";
import { CompetitorTable } from "./competitor-table";
import { SaveAsWatchlist } from "./save-as-watchlist";
import { formatCents } from "@/lib/format";

type ScanResponse =
  | { status: "PENDING"; scanId: string; errorMessage?: string | null }
  | { status: "RUNNING"; scanId: string; errorMessage?: string | null }
  | { status: "FAILED"; scanId: string; errorMessage?: string | null }
  | {
      status: "COMPLETED";
      scanId: string;
      query: string;
      location: string | null;
      userPrice: number | null;
      marketplaces: string[];
      watchlistId: string | null;
      createdAt: string;
      completedAt: string;
      report: {
        avgPrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
        totalListings: number;
        platformBreakdown: Record<
          string,
          { count: number; avgPrice: number; minPrice: number; maxPrice: number }
        >;
        pricePosition: number | null;
        recommendation: { message?: string } | null;
      } | null;
      listings: Array<{
        id: string;
        marketplace: string;
        title: string;
        price: number;
        condition: string | null;
        listingUrl: string;
        matchType: string;
        matchConfidence: number;
      }>;
    };

function heroToneFor(percentile: number): string {
  if (percentile < 0.25) return "border-amber-300 bg-amber-50 text-amber-900";
  if (percentile < 0.5) return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (percentile < 0.75) return "border-blue-300 bg-blue-50 text-blue-900";
  return "border-red-300 bg-red-50 text-red-900";
}

export function ScanView({ scanId }: { scanId: string }) {
  const { data, error } = useQuery<ScanResponse>({
    queryKey: ["scan", scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "COMPLETED" || s === "FAILED" ? false : 3000;
    },
  });

  if (error) return <p className="text-red-600">Failed to load: {(error as Error).message}</p>;
  if (!data) return <p className="text-gray-500">Loading...</p>;

  if (data.status === "PENDING" || data.status === "RUNNING") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        <span className="text-sm text-gray-600">{data.status}...</span>
      </div>
    );
  }

  if (data.status === "FAILED") {
    return (
      <div className="border border-red-300 bg-red-50 rounded-lg p-5">
        <div className="text-base font-semibold text-red-900">Scan failed</div>
        <p className="text-sm text-red-800 mt-2">
          {data.errorMessage ??
            "We couldn't retrieve listings from any of the selected marketplaces."}
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 text-sm font-medium text-red-900 hover:underline"
        >
          Try another scan →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{data.query}</h1>
          <p className="text-sm text-gray-500">
            {data.location ? `${data.location} · ` : ""}
            completed {new Date(data.completedAt).toLocaleString()}
          </p>
        </div>
        {data.watchlistId === null && (
          <SaveAsWatchlist
            scanId={data.scanId}
            query={data.query}
            location={data.location}
            userPrice={data.userPrice}
            marketplaces={data.marketplaces}
          />
        )}
      </header>

      {data.report ? (
        <>
          {data.userPrice !== null && data.report.pricePosition !== null && (
            <section
              className={`border rounded-lg p-5 ${heroToneFor(data.report.pricePosition)}`}
            >
              <div className="text-xs uppercase tracking-wide opacity-70">
                Your price position
              </div>
              <div className="text-xl font-semibold mt-1">
                {data.report.recommendation?.message ??
                  `${Math.round(data.report.pricePosition * 100)}th percentile`}
              </div>
              <div className="text-sm mt-2 opacity-80">
                Your price {formatCents(data.userPrice)} ·{" "}
                {Math.round(data.report.pricePosition * 100)}th percentile of{" "}
                {data.report.totalListings} comparable listings · median{" "}
                {formatCents(data.report.medianPrice)}
              </div>
            </section>
          )}

          <section>
            <PriceReport report={data.report} />
          </section>
          <section>
            <h2 className="text-lg font-medium mb-2">Price distribution</h2>
            <PriceChart listings={data.listings} userPrice={data.userPrice ?? undefined} />
          </section>
          <section>
            <h2 className="text-lg font-medium mb-2">By marketplace</h2>
            <MarketplaceBreakdown breakdown={data.report.platformBreakdown} />
          </section>
        </>
      ) : (
        <section className="border border-gray-200 bg-gray-50 rounded-lg p-5">
          <div className="text-base font-semibold text-gray-900">
            No comparable listings found
          </div>
          <p className="text-sm text-gray-700 mt-2">
            We extracted {data.listings.length} listing
            {data.listings.length === 1 ? "" : "s"}, but none matched
            &quot;{data.query}&quot; closely enough to benchmark. Try a more
            specific query or different marketplaces.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-sm font-medium text-blue-700 hover:underline"
          >
            Run another scan →
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium mb-2">Listings ({data.listings.length})</h2>
        <CompetitorTable listings={data.listings} />
      </section>
    </div>
  );
}
