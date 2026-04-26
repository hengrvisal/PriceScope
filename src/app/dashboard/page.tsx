import Link from "next/link";
import { prisma } from "@/lib/db";
import { ScanForm } from "@/components/scan-form";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const scans = session?.user?.id
    ? await prisma.scan.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-10">
      <header className="flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm">
          <span className="font-medium text-gray-900">Scans</span>
          <Link
            href="/dashboard/watchlists"
            className="text-gray-600 hover:text-gray-900"
          >
            Watchlists
          </Link>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{session?.user?.email}</span>
        </nav>
        <SignOutButton />
      </header>

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
