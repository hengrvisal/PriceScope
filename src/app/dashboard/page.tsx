import Link from "next/link";
import { prisma } from "@/lib/db";
import { ScanForm } from "@/components/scan-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold mb-4">New scan</h1>
        <ScanForm />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Recent scans</h2>
        {scans.length === 0 ? (
          <p className="text-sm text-gray-500">No scans yet.</p>
        ) : (
          <ul className="divide-y border rounded">
            {scans.map((s) => (
              <li key={s.id} className="p-3 flex items-center justify-between">
                <Link
                  href={`/dashboard/scans/${s.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {s.query}
                </Link>
                <span className="text-xs uppercase text-gray-500">
                  {s.status} · {new Date(s.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
