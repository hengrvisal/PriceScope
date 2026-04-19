# CLAUDE.md — PriceScope

---

## Behavioral Guidelines

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project Overview

PriceScope is a cross-marketplace price and product intelligence platform for marketplace sellers. A seller enters a product name and optionally their current price. The app deploys TinyFish web agents to crawl public listing pages across eBay AU, Gumtree, and Facebook Marketplace in parallel, extracts structured listing data, uses Claude API to fuzzy-match whether each listing is the same product, computes price statistics, and displays a benchmarking report.

**This is a READ-ONLY product.** We never log into anyone's marketplace account. We never post, modify, or write to any marketplace. We only extract publicly visible listing data from search and browse pages. This is non-negotiable.

---

## Data Flow (One Scan)

```
User submits scan (query + optional price/location)
  → POST /api/scans creates Scan record in Postgres, enqueues BullMQ job
    → Worker picks up job, sets status RUNNING
      → Fires TinyFish agents to all target marketplaces (Promise.allSettled)
        → Each agent: navigates search page, extracts listings, returns JSON
      → Parses SSE responses, validates with Zod
      → Sends listings to Claude API in batches of 10-15 for matching
        → Claude classifies each: exact/close/related/unrelated + confidence 0-1
      → Filters to confidence >= 0.6
      → Stores all listings in Postgres
      → Runs price stats engine (mean, median, percentiles, platform breakdown)
      → Creates ScanReport record
      → Sets scan status COMPLETED
  → Frontend polls GET /api/scans/[id] until complete, renders report
```

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Next.js 14+ (App Router) | TypeScript strict, Tailwind CSS |
| Charts | Recharts | Price distribution, trends |
| Server state | TanStack Query | Polling for scan status |
| Auth | NextAuth.js | Email + password |
| Database | Neon (serverless Postgres) | Via Prisma ORM |
| Queue | BullMQ + Redis | Async scan jobs |
| Redis | Upstash or Railway | Shared with BullMQ |
| Extraction | TinyFish API | SSE streaming endpoint |
| Matching | Anthropic Claude API | claude-sonnet-4-20250514 |
| Email | Resend | V2 alerts only |

---

## Database (Prisma + Neon)

### Connection Setup

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Neon pooled endpoint (app)
  directUrl = env("DIRECT_URL")        // Neon unpooled endpoint (migrations)
}
```

### Models

**User** — id, email, name, passwordHash, plan (FREE | STARTER | PRO | BUSINESS), createdAt

**Scan** — id, userId, query, category?, location?, userPrice? (cents), status (PENDING | RUNNING | COMPLETED | FAILED), errorMessage?, createdAt, completedAt

**Listing** — id, scanId, marketplace (EBAY_AU | FACEBOOK | GUMTREE | AMAZON_AU), title, price (cents), currency, condition?, sellerName?, location?, listingUrl, imageUrl?, matchType (EXACT | CLOSE | RELATED | UNRELATED), matchConfidence (float 0-1), rawData (JSON), extractedAt

**ScanReport** — id, scanId (unique), avgPrice, medianPrice, minPrice, maxPrice (all cents), totalListings, platformBreakdown (JSON), pricePosition? (percentile float), recommendation? (JSON), createdAt

**Watchlist** — V2, not built yet

**Alert** — V2, not built yet

### Data Rules

- All prices stored as integers in cents (1999 = $19.99). No floats for money.
- All timestamps UTC. Convert to user timezone only in frontend.
- Scan results are immutable. New scans create new snapshots.

---

## Project Structure

```
pricescope/
├── CLAUDE.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Main dashboard
│   │   │   └── scans/[id]/page.tsx     # Individual scan report
│   │   └── api/
│   │       ├── scans/
│   │       │   ├── route.ts            # POST create, GET list
│   │       │   └── [id]/route.ts       # GET scan results
│   │       └── auth/[...nextauth]/route.ts
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── redis.ts                    # Redis client (ioredis)
│   │   ├── queue.ts                    # BullMQ queue definitions
│   │   ├── env.ts                      # Zod-validated env vars
│   │   ├── tinyfish/
│   │   │   ├── client.ts              # TinyFish API client (SSE)
│   │   │   ├── parser.ts             # SSE stream parser + Zod validation
│   │   │   └── goals/
│   │   │       ├── ebay.ts
│   │   │       ├── gumtree.ts
│   │   │       ├── facebook.ts
│   │   │       └── amazon.ts
│   │   ├── matching/
│   │   │   └── product-matcher.ts     # Claude API batch matching
│   │   └── analysis/
│   │       └── price-stats.ts         # Statistical analysis
│   ├── workers/
│   │   ├── index.ts                   # Worker process entry
│   │   └── scan-worker.ts            # Scan job processor
│   ├── components/
│   │   ├── scan-form.tsx
│   │   ├── price-report.tsx
│   │   ├── price-chart.tsx
│   │   ├── marketplace-breakdown.tsx
│   │   └── competitor-table.tsx
│   └── types/
│       ├── scan.ts
│       ├── listing.ts
│       └── marketplace.ts
├── workers/
│   └── start.ts                       # Standalone worker entrypoint
├── scripts/
│   └── test-scan.ts                   # E2E pipeline test (no UI)
└── .env.example
```

---

## TinyFish Integration

### API Pattern

```
POST https://agent.tinyfish.ai/v1/automation/run-sse
Headers: X-API-Key, Content-Type: application/json
Body: { url, goal, browser_profile?, proxy_config? }
Response: SSE stream. Final event has type "COMPLETE", status "COMPLETED", resultJson has the data.
```

### Goal Prompts

Each marketplace has a goal template that returns a specific JSON schema. The goal must explicitly define the output structure — TinyFish returns cleaner data when the expected shape is specified.

Example pattern:

```typescript
export function buildGoal(query: string, category?: string, location?: string): string {
  return `Search for "${query}". Extract the first 15 listings. For each: title, price (number only), condition, listing URL. Return ONLY a JSON array: [{"title": str, "price": number, "condition": str, "url": str}]`;
}
```

### Marketplace Configs

| Marketplace | URL Pattern | Stealth | Proxy | Notes |
|-------------|------------|---------|-------|-------|
| eBay AU | ebay.com.au/sch/i.html?_nkw={query} | No | No | Most reliable, start here |
| Gumtree | gumtree.com.au/s-{category}/{location}/{query}/... | Yes | No | Needs stealth profile |
| Facebook | facebook.com/marketplace/{location}/search?query={query} | Yes | Yes | Hardest, skip in initial testing |
| Amazon AU | amazon.com.au/s?k={query} | No | No | Future addition |

### Error Handling

- Use Promise.allSettled for parallel marketplace calls — never block the whole scan because one marketplace failed.
- If a marketplace fails, log the raw response and mark it as failed. Return results from the others.
- Retry failed marketplaces once with browser_profile: "stealth" before giving up.

---

## Product Matching (Claude API)

### How It Works

TinyFish returns raw listings. Many won't be the same product the user searched for. Claude classifies each listing against the user's query.

### Prompt Pattern

```
User is looking for: "{query}"
User's current price: ${userPrice} (if provided)

Classify each listing as exact/close/related/unrelated with confidence 0.0-1.0.

Listing 1: {title} — ${price}
Listing 2: {title} — ${price}
...

Respond with JSON array only: [{"index": 0, "match": "exact", "confidence": 0.95}, ...]
```

### Rules

- Batch 10-15 listings per Claude call to reduce API costs.
- Model: claude-sonnet-4-20250514
- If Claude API fails, fall back to including all listings with confidence 0.5.
- Filter threshold for price report: confidence >= 0.6
- Store all listings in DB regardless of confidence (flag with matchType).

---

## Price Analysis Engine

### Computed Stats

- count, mean, median, min, max, stdDev, percentile25, percentile75
- Per-platform breakdown: { marketplace: { count, avgPrice, minPrice, maxPrice } }
- userPricePercentile (if user provided their price)

### Price Position Messaging

| Percentile | Message |
|-----------|---------|
| Below 25th | "Priced very competitively — you may be leaving money on the table" |
| 25th–50th | "Priced below average — competitive positioning" |
| 50th–75th | "Priced above average — ensure your listing quality justifies the premium" |
| Above 75th | "Priced significantly above market — consider adjusting unless your item has unique value" |

---

## API Routes

**POST /api/scans** — Create a new scan. Input: `{ query, category?, location?, userPrice?, marketplaces? }`. Defaults marketplaces to `["EBAY_AU", "GUMTREE"]`. Returns `{ scanId, status: "PENDING" }`.

**GET /api/scans/[id]** — Get scan results. Returns status only if PENDING/RUNNING. Returns full listings + report if COMPLETED.

**GET /api/scans** — List user's past scans. Paginated (page, limit params). Most recent first.

---

## Environment Variables

```
# Neon Postgres
DATABASE_URL=               # Pooled endpoint
DIRECT_URL=                 # Unpooled endpoint (migrations)

# Redis
REDIS_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# TinyFish
TINYFISH_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Email (V2)
RESEND_API_KEY=
```

Validate all env vars at startup with Zod. Fail fast with clear error messages if anything is missing.

---

## Coding Standards

- TypeScript strict mode. No `any` types except in catch blocks.
- Zod for ALL external data validation: TinyFish responses, Claude responses, API request bodies.
- All external API calls (TinyFish, Claude) wrapped in try/catch with structured error types.
- Prisma for all DB access. No raw SQL unless performance-critical.
- Server components by default. Client components only when interactivity is needed.
- Console.log with prefixed tags: `[tinyfish]`, `[matcher]`, `[stats]`, `[worker]`, `[api]`.
- No premature abstraction. If something is used once, inline it.

---

## MVP Scope

Build ONLY these features first:

- ✅ Scan form: product keywords + optional category + optional location + optional "my price"
- ✅ Scan execution across 2 marketplaces: eBay AU, Gumtree (add Facebook later)
- ✅ TinyFish extraction + SSE parsing
- ✅ Product matching via Claude API
- ✅ Price report: stats summary, price distribution chart, per-platform breakdown, listings table
- ✅ Scan history (list of past scans)
- ✅ Basic auth (email + password)

Do NOT build yet:

- ❌ Watchlists / monitoring
- ❌ Alerts / notifications
- ❌ AI pricing recommendations beyond position messaging
- ❌ Arbitrage detection
- ❌ Team accounts
- ❌ Public API access
- ❌ Payment / billing (hardcode plan limits, add Stripe later)
- ❌ Facebook Marketplace support (add after eBay + Gumtree work reliably)
