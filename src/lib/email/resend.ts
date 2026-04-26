import { Resend } from "resend";
import { env } from "../env";

let _client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(env.RESEND_API_KEY);
  return _client;
}

export type AlertEmailInput = {
  to: string;
  query: string;
  message: string;
  scanId: string;
  unsubscribeUrl?: string;
};

export type AlertEmailResult =
  | { sent: true; id: string }
  | { sent: false; reason: string };

export async function sendAlertEmail(input: AlertEmailInput): Promise<AlertEmailResult> {
  const client = getClient();
  if (!client) return { sent: false, reason: "RESEND_API_KEY not configured" };

  const from = env.RESEND_FROM_EMAIL ?? "PriceScope <alerts@pricescope.app>";
  const appUrl = env.APP_URL ?? "http://localhost:3000";
  const scanUrl = `${appUrl}/dashboard/scans/${input.scanId}`;

  const subject = `Price alert: "${input.query}"`;

  const unsubLine = input.unsubscribeUrl
    ? `<p style="font-size:12px;color:#888;margin-top:32px">Don't want these alerts? <a href="${input.unsubscribeUrl}">Unsubscribe from this watchlist</a>.</p>`
    : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px">Price movement detected</h2>
      <p>Watchlist: <strong>${escapeHtml(input.query)}</strong></p>
      <p>${escapeHtml(input.message)}</p>
      <p><a href="${scanUrl}" style="color:#2563eb">View the latest scan</a></p>
      ${unsubLine}
    </div>
  `;

  const text = [
    `Price movement detected`,
    `Watchlist: ${input.query}`,
    input.message,
    `View the latest scan: ${scanUrl}`,
    input.unsubscribeUrl ? `Unsubscribe: ${input.unsubscribeUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      subject,
      html,
      text,
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true, id: data?.id ?? "unknown" };
  } catch (err) {
    return { sent: false, reason: (err as Error).message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
