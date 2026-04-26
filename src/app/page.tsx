import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const primaryHref = signedIn ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-gray-900">
            PriceScope
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Know what your product is selling for, everywhere.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              PriceScope scans eBay, Amazon, Catch, and Facebook Marketplace at
              once and shows you exactly where your price sits in the market.
            </p>
            <p className="mt-2 text-lg text-gray-600 leading-relaxed">
              Stop guessing. Start pricing right.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center px-5 py-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Start your first scan
              </Link>
              <a
                href="#how-it-works"
                className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
              >
                How it works →
              </a>
            </div>
          </div>
          <HeroChartMock />
        </div>
      </section>

      <section id="how-it-works" className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Three steps.
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <Step
              icon={<TagIcon />}
              title="Tell us what you're selling"
              body="Type the product name. Optionally add your current asking price so we can show you where it sits."
            />
            <Step
              icon={<RadarIcon />}
              title="We check the market"
              body="Agents scan eBay, Amazon, Catch, and Facebook Marketplace in parallel. Usually finishes in under three minutes."
            />
            <Step
              icon={<ChartIcon />}
              title="You get a clear answer"
              body="A short report: median price, where you rank, and the actual listings other sellers are running right now."
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          A real answer in under three minutes.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 gap-12 items-start">
          <ReportMock />
          <div className="space-y-8">
            <Benefit
              icon={<RankIcon />}
              title="See where your price ranks"
              body="A percentile-based read on whether you're priced low, fair, or high — with a one-line recommendation."
            />
            <Benefit
              icon={<MarketIcon />}
              title="Compare across four marketplaces"
              body="eBay AU, Amazon AU, Catch, and Facebook Marketplace, all in one view. No more flipping between tabs."
            />
            <Benefit
              icon={<BellIcon />}
              title="Get notified when the market moves"
              body="Save a scan as a watchlist and get a weekly email if the median price shifts more than 5%."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-24">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for sellers who care about pricing right.
          </h2>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            PriceScope is read-only. We never log into your marketplace
            accounts and never post or change anything on your behalf. We just
            read the public listing pages — the same ones a buyer would see —
            and turn them into market data you can use.
          </p>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            Smart matching filters out listings that aren&apos;t actually your
            product, so the numbers you see reflect real comparables — not
            random noise from the search results.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Find out what your listing is worth.
        </h2>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center px-6 py-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Start your first scan
          </Link>
          <p className="text-sm text-gray-500">Free to try. No credit card.</p>
        </div>
      </section>

      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold tracking-tight text-gray-900">PriceScope</span>
          <span className="text-xs text-gray-500">
            © {new Date().getFullYear()} PriceScope
          </span>
        </div>
      </footer>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function HeroChartMock() {
  const bars = [12, 22, 36, 58, 78, 92, 86, 70, 50, 32, 20, 14];
  const userIdx = 7;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Price distribution · 28 listings</span>
        <span className="text-blue-600 font-medium">Your price</span>
      </div>
      <svg viewBox="0 0 320 140" className="mt-4 w-full h-36">
        {bars.map((h, i) => {
          const x = 8 + i * 25;
          const barH = h;
          const y = 120 - barH;
          const isUser = i === userIdx;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={18}
              height={barH}
              rx={2}
              className={isUser ? "fill-blue-600" : "fill-gray-200"}
            />
          );
        })}
        <line
          x1={8 + userIdx * 25 + 9}
          x2={8 + userIdx * 25 + 9}
          y1={4}
          y2={132}
          className="stroke-blue-600"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line x1={0} x2={320} y1={120} y2={120} className="stroke-gray-300" strokeWidth={1} />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Median" value="$349" />
        <MiniStat label="Your rank" value="62nd" accent />
        <MiniStat label="Listings" value="28" />
      </div>
    </div>
  );
}

function ReportMock() {
  const bars = [10, 18, 30, 48, 72, 88, 80, 64, 44, 28, 16, 10];
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportTile label="Median" value="$349" />
        <ReportTile label="Mean" value="$362" />
        <ReportTile label="Listings" value="28" />
        <ReportTile label="Marketplaces" value="3" />
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-2">Price distribution</div>
        <svg viewBox="0 0 320 90" className="w-full h-20">
          {bars.map((h, i) => {
            const x = 8 + i * 25;
            const y = 80 - h;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={18}
                height={h}
                rx={2}
                className="fill-gray-200"
              />
            );
          })}
          <line
            x1={8 + 6 * 25 + 9}
            x2={8 + 6 * 25 + 9}
            y1={4}
            y2={88}
            className="stroke-blue-600"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </svg>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-2">Recent listings</div>
        <div className="border border-gray-200 rounded divide-y text-sm">
          <ListingRow market="eBay AU" title="Sony WH-1000XM5 Black" price="$359" />
          <ListingRow market="Amazon AU" title="Sony WH-1000XM5 Wireless" price="$379" />
          <ListingRow market="Catch" title="Sony WH1000XM5 Headphones" price="$329" />
        </div>
      </div>
    </div>
  );
}

function ReportTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-200 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-gray-200 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={`mt-0.5 text-sm font-semibold ${accent ? "text-blue-600" : "text-gray-900"}`}
      >
        {value}
      </div>
    </div>
  );
}

function ListingRow({
  market,
  title,
  price,
}: {
  market: string;
  title: string;
  price: string;
}) {
  return (
    <div className="px-3 py-2 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{market}</div>
        <div className="truncate text-gray-800">{title}</div>
      </div>
      <div className="font-medium text-gray-900">{price}</div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 12 18 6" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12" y="8" width="3" height="10" />
      <rect x="17" y="5" width="3" height="13" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="8" height="8" rx="1" />
      <rect x="13" y="4" width="8" height="4" rx="1" />
      <rect x="13" y="10" width="8" height="10" rx="1" />
      <rect x="3" y="14" width="8" height="6" rx="1" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
