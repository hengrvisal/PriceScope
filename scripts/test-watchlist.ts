import { prisma } from "../src/lib/db";
import { evaluateWatchlistAlert, recordAlertIfShifted } from "../src/lib/alerts/evaluate";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log(`\n=== test-watchlist (${DRY_RUN ? "DRY RUN" : "LIVE"}) ===\n`);

  const watchlists = await prisma.watchlist.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: {
      scans: {
        where: { status: "COMPLETED", report: { isNot: null } },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { id: true, createdAt: true, report: { select: { medianPrice: true } } },
      },
      user: { select: { email: true } },
    },
  });

  if (watchlists.length === 0) {
    console.log("No active watchlists found.");
    return;
  }

  console.log(`Found ${watchlists.length} active watchlist(s)\n`);

  for (const w of watchlists) {
    console.log(`--- watchlist ${w.id} ---`);
    console.log(`  query: "${w.query}"  user: ${w.user.email}`);
    console.log(`  nextRunAt: ${w.nextRunAt.toISOString()}  lastRunAt: ${w.lastRunAt?.toISOString() ?? "never"}`);
    console.log(`  recent completed scans: ${w.scans.length}`);
    for (const s of w.scans) {
      console.log(
        `    - scan ${s.id} @ ${s.createdAt.toISOString()} median $${((s.report?.medianPrice ?? 0) / 100).toFixed(2)}`
      );
    }

    if (w.scans.length === 0) {
      console.log(`  → no completed scans, skipping`);
      continue;
    }

    const latestScanId = w.scans[0].id;
    const evaluation = await evaluateWatchlistAlert(w.id, latestScanId);
    console.log(`  evaluation:`, evaluation);

    if (DRY_RUN) {
      console.log(`  (dry run — no alert created)`);
      continue;
    }

    if (evaluation.kind === "shift") {
      const result = await recordAlertIfShifted(w.id, latestScanId);
      console.log(
        `  → alert created=${result.created} emailSent=${result.emailSent}`
      );
    }
  }
}

main()
  .then(() => {
    console.log("\n=== done ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("test-watchlist failed:", err);
    process.exit(1);
  });
