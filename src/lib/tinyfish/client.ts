import { z } from "zod";
import { env } from "../env";

const TINYFISH_URL = "https://agent.tinyfish.ai/v1/automation/run-sse";

export type TinyFishRunOptions = {
  url: string;
  goal: string;
  browser_profile?: string;
  proxy_config?: Record<string, unknown>;
  timeoutMs?: number;
};

export class TinyFishError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "TinyFishError";
  }
}

export class TinyFishMissingResultError extends TinyFishError {
  constructor(message: string) {
    super(message);
    this.name = "TinyFishMissingResultError";
  }
}

export class TinyFishEmptyResultError extends TinyFishError {
  constructor(message: string) {
    super(message);
    this.name = "TinyFishEmptyResultError";
  }
}

export class TinyFishValidationError extends TinyFishError {
  constructor(message: string, public readonly issues: z.ZodIssue[]) {
    super(message);
    this.name = "TinyFishValidationError";
  }
}

export class TinyFishAgentFailedError extends TinyFishError {
  constructor(
    message: string,
    public readonly reason: string,
    public readonly details: string
  ) {
    super(message);
    this.name = "TinyFishAgentFailedError";
  }
}

const ResultSchema = z.array(z.unknown());

function unwrapResult(value: unknown): unknown {
  let current = value;
  for (let i = 0; i < 5; i++) {
    if (Array.isArray(current)) return current;
    if (current && typeof current === "object" && "result" in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>).result;
      continue;
    }
    return current;
  }
  return current;
}

type SSEEvent = { event: string; data: string };

function parseSSEChunk(buffer: string): { events: SSEEvent[]; rest: string } {
  const events: SSEEvent[] = [];
  let rest = buffer;
  let boundary = rest.indexOf("\n\n");
  while (boundary !== -1) {
    const block = rest.slice(0, boundary);
    rest = rest.slice(boundary + 2);
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length > 0) events.push({ event, data: dataLines.join("\n") });
    boundary = rest.indexOf("\n\n");
  }
  return { events, rest };
}

export async function runTinyFishAutomation(opts: TinyFishRunOptions): Promise<unknown> {
  const timeoutMs = opts.timeoutMs ?? 300_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body: Record<string, unknown> = { url: opts.url, goal: opts.goal };
  if (opts.browser_profile) body.browser_profile = opts.browser_profile;
  if (opts.proxy_config) body.proxy_config = opts.proxy_config;

  const startedAt = Date.now();
  console.log(`[tinyfish] → ${opts.url} (timeout=${timeoutMs}ms)`);
  console.log('[tinyfish] request body:', JSON.stringify(body, null, 2));

  let res: Response;
  try {
    res = await fetch(TINYFISH_URL, {
      method: "POST",
      headers: {
        "X-API-Key": env.TINYFISH_API_KEY,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    throw new TinyFishError(`fetch failed: ${(err as Error).message}`, err);
  }

  console.log(`[tinyfish] ← HTTP ${res.status} (${Date.now() - startedAt}ms elapsed, streaming...)`);

  if (!res.ok || !res.body) {
    clearTimeout(timer);
    const text = await res.text().catch(() => "");
    throw new TinyFishError(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let resultJson: unknown = null;
  let lastStatus: string | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSSEChunk(buffer);
      buffer = parsed.rest;
      for (const ev of parsed.events) {
        let payload: any;
        try {
          payload = JSON.parse(ev.data);
        } catch {
          console.warn(`[tinyfish] non-JSON event data: ${ev.data.slice(0, 200)}`);
          continue;
        }
        const elapsed = Date.now() - startedAt;
        if (payload?.type === "PROGRESS") {
          console.log(`[tinyfish] ${elapsed}ms PROGRESS: ${payload.purpose ?? ""}`);
        } else if (payload?.type && payload.type !== "HEARTBEAT") {
          console.log(`[tinyfish] ${elapsed}ms ${payload.type}`);
        }
        if (payload?.status) lastStatus = payload.status;
        if (ev.event === "COMPLETE" || payload?.type === "COMPLETE") {
          console.log('[tinyfish] COMPLETE event:', JSON.stringify(payload, null, 2));
          if (payload?.status !== "COMPLETED") {
            throw new TinyFishError(
              `COMPLETE with non-success status: ${payload?.status ?? "unknown"}`
            );
          }
          const resultJsonMissing = payload?.resultJson === undefined;
          const resultMissing = payload?.result === undefined;
          if (resultJsonMissing && resultMissing) {
            throw new TinyFishMissingResultError(
              "COMPLETE event has neither resultJson nor result field"
            );
          }
          const rawResult = payload?.resultJson ?? payload?.result;
          console.log('[tinyfish] raw result payload:', JSON.stringify(rawResult, null, 2));
          const unwrapped = unwrapResult(rawResult);
          if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
            const obj = unwrapped as Record<string, unknown>;
            if (obj.status === "failed" || obj.status === "error") {
              const reason =
                typeof obj.reason === "string"
                  ? obj.reason
                  : typeof obj.message === "string"
                    ? obj.message
                    : "unknown";
              const details = typeof obj.details === "string" ? obj.details : "";
              throw new TinyFishAgentFailedError(
                `agent reported failure: ${reason} — ${details}`,
                reason,
                details
              );
            }
          }
          const parsed = ResultSchema.safeParse(unwrapped);
          if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];
            const failingItem = Array.isArray(unwrapped) && typeof firstIssue?.path?.[0] === "number"
              ? (unwrapped as unknown[])[firstIssue.path[0] as number]
              : undefined;
            console.error('[tinyfish] zod issue:', JSON.stringify(firstIssue, null, 2));
            if (failingItem !== undefined) {
              console.error('[tinyfish] first failing listing:', JSON.stringify(failingItem, null, 2));
            }
            throw new TinyFishValidationError(
              `result failed schema validation: ${firstIssue?.message ?? "unknown"} at path [${firstIssue?.path?.join(".") ?? ""}]`,
              parsed.error.issues
            );
          }
          if (parsed.data.length === 0) {
            throw new TinyFishEmptyResultError(
              "result field is present but array has 0 items"
            );
          }
          resultJson = parsed.data;
        }
      }
    }
  } finally {
    clearTimeout(timer);
  }

  const elapsed = Date.now() - startedAt;
  if (resultJson === null) {
    throw new TinyFishError(
      `stream ended without COMPLETE (lastStatus=${lastStatus}, elapsed=${elapsed}ms)`
    );
  }
  console.log(`[tinyfish] ✓ ${opts.url} (${elapsed}ms)`);
  return resultJson;
}
