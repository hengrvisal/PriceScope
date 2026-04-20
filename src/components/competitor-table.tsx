"use client";

import { useMemo, useState } from "react";
import { formatCents, MARKETPLACE_LABEL } from "@/lib/format";

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

type SortField = "price" | "confidence";
type SortDir = "asc" | "desc";

const MATCH_TYPE_TONE: Record<string, string> = {
  EXACT: "bg-emerald-100 text-emerald-800",
  CLOSE: "bg-blue-100 text-blue-800",
  RELATED: "bg-amber-100 text-amber-800",
  UNRELATED: "bg-gray-100 text-gray-700",
};

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 ml-1 opacity-60"
    >
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  );
}

function SortHeader({
  label,
  field,
  activeField,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = activeField === field;
  const arrow = isActive ? (dir === "asc" ? "▲" : "▼") : "";
  return (
    <th
      className={`py-2 ${align === "right" ? "text-right" : "text-left"} cursor-pointer select-none hover:text-gray-900`}
      onClick={() => onSort(field)}
    >
      <span className={isActive ? "text-gray-900" : "text-gray-500"}>
        {label} {arrow}
      </span>
    </th>
  );
}

export function CompetitorTable({ listings }: { listings: Listing[] }) {
  const [sortField, setSortField] = useState<SortField>("confidence");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const copy = [...listings];
    copy.sort((a, b) => {
      const av = sortField === "price" ? a.price : a.matchConfidence;
      const bv = sortField === "price" ? b.price : b.matchConfidence;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [listings, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "price" ? "asc" : "desc");
    }
  }

  if (listings.length === 0)
    return <p className="text-sm text-gray-500">No listings.</p>;

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="py-2 px-3 text-left text-xs uppercase tracking-wide text-gray-500">
              Listing
            </th>
            <th className="py-2 px-3 text-left text-xs uppercase tracking-wide text-gray-500">
              Marketplace
            </th>
            <SortHeader
              label="Price"
              field="price"
              activeField={sortField}
              dir={sortDir}
              onSort={handleSort}
              align="right"
            />
            <SortHeader
              label="Match"
              field="confidence"
              activeField={sortField}
              dir={sortDir}
              onSort={handleSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((l) => (
            <tr key={l.id} className="border-b last:border-b-0 hover:bg-gray-50 align-top">
              <td className="py-3 px-3 max-w-md">
                <a
                  href={l.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-gray-900 hover:text-blue-700"
                >
                  {l.title}
                  <ExternalLinkIcon />
                </a>
                {l.condition && (
                  <div className="text-xs text-gray-500 mt-0.5">{l.condition}</div>
                )}
              </td>
              <td className="py-3 px-3">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {MARKETPLACE_LABEL[l.marketplace] ?? l.marketplace}
                </span>
              </td>
              <td className="py-3 px-3 text-right">
                <div className="text-base font-semibold text-gray-900">
                  {formatCents(l.price)}
                </div>
              </td>
              <td className="py-3 px-3 text-right whitespace-nowrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    MATCH_TYPE_TONE[l.matchType] ?? MATCH_TYPE_TONE.UNRELATED
                  }`}
                >
                  {l.matchType}
                </span>
                <div className="text-xs text-gray-500 mt-0.5">
                  {l.matchConfidence.toFixed(2)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
