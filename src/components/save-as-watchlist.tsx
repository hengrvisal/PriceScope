"use client";

import { useState, type FormEvent } from "react";
import { marketplaceLabel } from "@/lib/format";

type Props = {
  scanId: string;
  query: string;
  location: string | null;
  userPrice: number | null;
  marketplaces: string[];
};

export function SaveAsWatchlist({
  scanId,
  query,
  location,
  userPrice,
  marketplaces,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ nextRunAt: string } | null>(null);

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          location: location ?? undefined,
          userPrice: userPrice ?? undefined,
          marketplaces,
          seedScanId: scanId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setCreated({ nextRunAt: json.nextRunAt });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-4 text-sm text-emerald-900">
        Watchlist saved. Next run: {new Date(created.nextRunAt).toLocaleString()}.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border rounded px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
      >
        Save as watchlist
      </button>
    );
  }

  return (
    <form
      onSubmit={onConfirm}
      className="border rounded-lg p-4 bg-white space-y-3 text-sm"
    >
      <div className="font-medium text-gray-900">Save as weekly watchlist</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-gray-700">
        <dt className="text-gray-500">Query</dt>
        <dd>{query}</dd>
        {location && (
          <>
            <dt className="text-gray-500">Location</dt>
            <dd>{location}</dd>
          </>
        )}
        {userPrice !== null && (
          <>
            <dt className="text-gray-500">Your price</dt>
            <dd>${(userPrice / 100).toFixed(2)}</dd>
          </>
        )}
        <dt className="text-gray-500">Marketplaces</dt>
        <dd>{marketplaces.map(marketplaceLabel).join(", ")}</dd>
        <dt className="text-gray-500">Frequency</dt>
        <dd>Weekly</dd>
      </dl>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-1.5 font-medium disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border rounded px-3 py-1.5 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
