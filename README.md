# PriceScope

Cross-marketplace price and product intelligence for marketplace sellers. Enter a product name (and optionally your current price); PriceScope crawls public listings on eBay AU, Gumtree, Amazon AU, and Facebook Marketplace in parallel, classifies which listings are the same product using Claude, and returns a benchmarking report — distribution, percentile, per-platform breakdown, and a positioning recommendation.

**Read-only.** PriceScope never logs into anyone's marketplace account and never writes, posts, or modifies anything. It only reads publicly visible search and browse pages.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Web | Next.js 16 (App Router), TypeScript strict, Tailwind |
| Charts | Recharts |
| Server state | TanStack Query (polling for scan status) |
| Auth | NextAuth.js (email + password, JWT sessions) |
| Database | Neon Postgres via Prisma |
| Queue | BullMQ + Redis |
| Extraction | TinyFish API (SSE) |
| Matching | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Email (V2) | Resend |

---

## Prerequisites

- Node.js 20+
- A Neon Postgres database (pooled + direct URLs)
- A Redis instance (Upstash, Railway, or local)
- A TinyFish API key
- An Anthropic API key

---

## Setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# fill in DATABASE_URL, DIRECT_URL, REDIS_URL,
# NEXTAUTH_SECRET, TINYFISH_API_KEY, ANTHROPIC_API_KEY

# 3. Generate the Prisma client and push the schema
npm run prisma:generate
npm run prisma:migrate
```

Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

---

## Running locally

PriceScope needs **two processes** in dev: the Next.js server and the BullMQ worker. Open two terminals.

```bash
# Terminal 1 — web app
npm run dev

# Terminal 2 — scan worker
npm run worker
```

Then visit http://localhost:3000.

If `next dev` causes high memory usage, run with webpack instead of Turbopack:

```bash
npx next dev --webpack
```

---

## How a scan flows

```
User submits scan (query + optional price/location)
  -> POST /api/scans creates a Scan row, enqueues BullMQ job
    -> Worker picks up job, sets status RUNNING
      -> Fires TinyFish agents to all marketplaces (Promise.allSettled)
      -> Parses + validates SSE responses with Zod
      -> Sends listings to Claude in parallel batches of 12 for matching
      -> Filters to confidence >= 0.6 for the report
      -> Stores all listings, computes price stats, writes ScanReport
      -> Sets status COMPLETED
  -> Frontend polls GET /api/scans/[id] until complete, renders report
```

---

## API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/scans` | Create a scan. Body: `{ query, category?, location?, userPrice?, marketplaces? }`. Returns `{ scanId, status }`. |
| `GET` | `/api/scans/:id` | Status while pending/running, or full report + listings when complete. |
| `GET` | `/api/scans` | Paginated list of the current user's scans. |
| `POST` | `/api/auth/signup` | Create a user. |

Auth-protected routes require a NextAuth session.

---

## Data model

All prices stored as integers in cents (`1999` = $19.99). All timestamps UTC.

- `User` — email + password (bcrypt), plan tier
- `Scan` — query + status + marketplaces selected
- `Listing` — one extracted listing, with marketplace, price, match type, and confidence
- `ScanReport` — aggregated stats (mean / median / min / max / percentile / per-platform breakdown)
- `Watchlist`, `Alert` — V2 (recurring scans + median-shift email alerts)

See `prisma/schema.prisma` for the full schema.

---

## Project layout

```
src/
  app/                    # Next.js App Router (pages + API routes)
  components/             # React components (server + client)
  lib/
    db.ts                 # Prisma singleton
    redis.ts              # IORedis singleton
    queue.ts              # BullMQ queue definitions
    env.ts                # Zod-validated env vars
    tinyfish/             # TinyFish client + per-marketplace goal builders
    matching/             # Claude product-matching
    analysis/             # Price stats engine
    alerts/               # V2 alert evaluation
  workers/
    scan-worker.ts        # BullMQ scan job processor
    index.ts              # Worker entrypoint
prisma/
  schema.prisma
scripts/
  test-scan.ts            # End-to-end pipeline test (no UI)
  test-watchlist.ts       # Watchlist alert test
workers/
  start.ts                # Standalone worker entry (npm run worker)
```

---

## Useful scripts

```bash
npm run dev               # Next.js dev server
npm run worker            # BullMQ scan worker
npm run build             # Production build
npm run start             # Run production build
npm run lint              # ESLint
npm run test:scan         # End-to-end scan pipeline test
npm run test:watchlist    # Watchlist alert test
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:migrate    # Run pending migrations
```

---

## Notes

- Marketplace fetches within a single scan run in parallel (`Promise.allSettled`).
- Claude match batches also run in parallel (`Promise.all`), so total matching time is roughly the slowest single batch.
- The BullMQ worker accepts up to 2 scans concurrently (`concurrency: 2` in `src/workers/scan-worker.ts`).
- Failed marketplaces are retried once with the `stealth` browser profile before being marked failed; a scan only fails entirely if every marketplace returned no listings.
