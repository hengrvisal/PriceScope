"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ScanForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [userPriceDollars, setUserPriceDollars] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        query: query.trim(),
        marketplaces: ["EBAY_AU", "AMAZON_AU"],
      };
      if (category.trim()) body.category = category.trim();
      if (location.trim()) body.location = location.trim();
      if (userPriceDollars.trim()) {
        const dollars = parseFloat(userPriceDollars);
        if (Number.isFinite(dollars) && dollars >= 0) {
          body.userPrice = Math.round(dollars * 100);
        }
      }

      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      router.push(`/dashboard/scans/${json.scanId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Product keywords</label>
        <input
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. laptop 16gb ram"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category (optional)</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location (optional)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. melbourne"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your price in AUD (optional)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={userPriceDollars}
          onChange={(e) => setUserPriceDollars(e.target.value)}
          placeholder="e.g. 399.00"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || query.trim().length === 0}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting ? "Starting scan..." : "Start scan"}
      </button>
    </form>
  );
}
