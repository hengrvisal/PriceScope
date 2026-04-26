import { prisma } from "../db";
import { sendAlertEmail } from "../email/resend";

export const MEDIAN_SHIFT_THRESHOLD = 0.05;

export type AlertEvaluation =
  | { kind: "no_baseline"; reason: string }
  | { kind: "no_report"; reason: string }
  | { kind: "no_shift"; previousMedian: number; currentMedian: number; deltaPct: number }
  | {
      kind: "shift";
      previousMedian: number;
      currentMedian: number;
      deltaPct: number;
      direction: "up" | "down";
      message: string;
    };

export async function evaluateWatchlistAlert(
  watchlistId: string,
  scanId: string
): Promise<AlertEvaluation> {
  const currentReport = await prisma.scanReport.findUnique({
    where: { scanId },
    select: { medianPrice: true },
  });

  if (!currentReport) {
    return { kind: "no_report", reason: "current scan has no report" };
  }

  const previousScan = await prisma.scan.findFirst({
    where: {
      watchlistId,
      status: "COMPLETED",
      id: { not: scanId },
      report: { isNot: null },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, report: { select: { medianPrice: true } } },
  });

  if (!previousScan?.report) {
    return { kind: "no_baseline", reason: "no prior completed scan with report" };
  }

  const previousMedian = previousScan.report.medianPrice;
  const currentMedian = currentReport.medianPrice;

  if (previousMedian === 0) {
    return { kind: "no_baseline", reason: "previous median is zero" };
  }

  const deltaPct = (currentMedian - previousMedian) / previousMedian;
  const absDelta = Math.abs(deltaPct);

  if (absDelta < MEDIAN_SHIFT_THRESHOLD) {
    return { kind: "no_shift", previousMedian, currentMedian, deltaPct };
  }

  const direction: "up" | "down" = deltaPct > 0 ? "up" : "down";
  const pctStr = `${(absDelta * 100).toFixed(1)}%`;
  const dirWord = direction === "up" ? "rose" : "dropped";
  const prevDollar = (previousMedian / 100).toFixed(2);
  const curDollar = (currentMedian / 100).toFixed(2);
  const message = `Median price ${dirWord} ${pctStr} (from $${prevDollar} to $${curDollar})`;

  return {
    kind: "shift",
    previousMedian,
    currentMedian,
    deltaPct,
    direction,
    message,
  };
}

export async function recordAlertIfShifted(
  watchlistId: string,
  scanId: string,
  options?: { unsubscribeUrl?: string }
): Promise<{ created: boolean; emailSent: boolean; evaluation: AlertEvaluation }> {
  const evaluation = await evaluateWatchlistAlert(watchlistId, scanId);

  if (evaluation.kind !== "shift") {
    return { created: false, emailSent: false, evaluation };
  }

  const alert = await prisma.alert.create({
    data: {
      watchlistId,
      scanId,
      alertType: "MEDIAN_SHIFT",
      message: evaluation.message,
    },
  });

  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
    select: { query: true, user: { select: { email: true } } },
  });

  let emailSent = false;
  if (watchlist?.user?.email) {
    const result = await sendAlertEmail({
      to: watchlist.user.email,
      query: watchlist.query,
      message: evaluation.message,
      scanId,
      unsubscribeUrl: options?.unsubscribeUrl,
    });
    if (result.sent) {
      emailSent = true;
      await prisma.alert.update({
        where: { id: alert.id },
        data: { sentAt: new Date() },
      });
    } else {
      console.error(`[alerts] email send failed for alert ${alert.id}: ${result.reason}`);
    }
  }

  return { created: true, emailSent, evaluation };
}
