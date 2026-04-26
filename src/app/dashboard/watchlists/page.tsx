import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { marketplaceLabel } from "@/lib/format";
import { DeleteWatchlistButton } from "@/components/delete-watchlist-button";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function WatchlistsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const watchlists = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Scans
          </Link>
          <span className="font-medium text-gray-900">Watchlists</span>
        </nav>
        <SignOutButton />
      </header>

      <section>
        <h1 className="text-2xl font-semibold mb-4">Watchlists</h1>
        {watchlists.length === 0 ? (
          <p className="text-sm text-gray-500">
            No watchlists yet. Save a completed scan as a watchlist to get
            weekly alerts when the median price moves.
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b text-left">
                  <th className="py-2 px-3">Query</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Marketplaces</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Next run</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlists.map((w) => {
                  const latestScanId = w.scans[0]?.id ?? null;
                  return (
                    <tr key={w.id} className="border-b last:border-b-0 align-top">
                      <td className="py-3 px-3 font-medium text-gray-900">
                        {w.query}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {w.location ?? "—"}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {w.marketplaces.map(marketplaceLabel).join(", ")}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {w.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {w.active
                          ? w.nextRunAt.toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            w.active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {w.active ? "Active" : "Paused"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-3 whitespace-nowrap">
                        {latestScanId && (
                          <Link
                            href={`/dashboard/scans/${latestScanId}`}
                            className="text-sm text-blue-700 hover:underline"
                          >
                            Latest scan
                          </Link>
                        )}
                        <DeleteWatchlistButton id={w.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
