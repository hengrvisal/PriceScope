"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteWatchlistButton({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this watchlist? Future alerts will stop.")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(`Failed: ${json.error ?? res.status}`);
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={submitting}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {submitting ? "Deleting..." : "Delete"}
    </button>
  );
}
