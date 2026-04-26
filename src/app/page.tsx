import { auth } from "@/lib/auth";
import { Nav } from "@/components/landing/nav";
import { PriceTicker } from "@/components/landing/price-ticker";
import { CtaButton } from "@/components/landing/cta-button";
import { FeatureCard } from "@/components/landing/feature-card";
import { tok, SYNE } from "@/components/landing/tokens";

export default async function LandingPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const primaryHref = isSignedIn ? "/dashboard" : "/signup";

  return (
    <div style={{ background: tok.bg, minHeight: "100vh" }}>
      <Nav isSignedIn={isSignedIn} />

      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 40px 80px",
          position: "relative",
          overflow: "hidden",
          background: tok.bg,
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-5%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${tok.accent}18 0%, transparent 65%)`,
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "-10%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.65 0.18 260 / 0.12) 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-5%",
              left: "30%",
              width: 500,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.70 0.16 230 / 0.10) 0%, transparent 65%)",
              filter: "blur(70px)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${tok.accent}18 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: 1160,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60,
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 520px", maxWidth: 560 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 100,
                border: `1px solid ${tok.accent}44`,
                background: `${tok.accent}10`,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: tok.accent,
                  boxShadow: `0 0 6px ${tok.accent}`,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: tok.accent,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Cross-marketplace price intelligence
              </span>
            </div>

            <h1
              style={{
                fontFamily: SYNE,
                fontSize: "clamp(36px, 5vw, 62px)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: tok.text,
                textWrap: "pretty",
                marginBottom: 24,
              }}
            >
              Know what your product is selling for, everywhere.
            </h1>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.65,
                color: tok.textMuted,
                maxWidth: 460,
                marginBottom: 40,
              }}
            >
              PriceScope scans eBay, Amazon, Catch, and Facebook Marketplace at once and shows
              you exactly where your price sits in the market. Stop guessing. Start pricing
              right.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <CtaButton href={primaryHref} label="Start your first scan →" variant="hero" />
              <span style={{ fontSize: 13, color: tok.textMuted }}>No credit card required</span>
            </div>

            <div style={{ display: "flex", gap: 32, marginTop: 52, flexWrap: "wrap" }}>
              {[
                ["4", "Marketplaces scanned in parallel"],
                ["~3 min", "Average scan time"],
                ["100%", "Read-only — never logs into your accounts"],
              ].map(([n, l]) => (
                <div key={l} style={{ maxWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: SYNE,
                      fontSize: 26,
                      fontWeight: 800,
                      color: tok.text,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ fontSize: 13, color: tok.textMuted, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
            <PriceTicker />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "100px 40px", background: tok.bgMid }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                fontFamily: SYNE,
                fontSize: 12,
                fontWeight: 700,
                color: tok.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Features
            </div>
            <h2
              style={{
                fontFamily: SYNE,
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: tok.text,
                lineHeight: 1.1,
              }}
            >
              Everything you need to price with confidence
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M7 11h8M11 7v8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Cross-marketplace scanning"
              desc="We scan eBay, Amazon, Catch, and Facebook Marketplace in parallel. You see the full picture of your product's market in one report."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect
                    x="2"
                    y="13"
                    width="4"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="9"
                    y="8"
                    width="4"
                    height="12"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="16"
                    y="3"
                    width="4"
                    height="17"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              }
              title="Smart matching"
              desc="Not every search result is actually your product. PriceScope filters out unrelated listings automatically, so you compare like for like."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <polyline
                    points="3,17 8,10 13,13 19,5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="19" cy="5" r="2" fill="currentColor" />
                </svg>
              }
              title="Where you sit in the market"
              desc="Get a clear percentile-based read on your price. Are you priced competitively, leaving money on the table, or above market? PriceScope tells you in plain language."
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M11 7v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="Watchlists with weekly alerts"
              desc="Save a search and get an email when the market median moves more than 5% in either direction. You'll know when to relist or re-price without checking every day."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: "100px 40px", background: tok.bg }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div
              style={{
                fontFamily: SYNE,
                fontSize: 12,
                fontWeight: 700,
                color: tok.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              How it works
            </div>
            <h2
              style={{
                fontFamily: SYNE,
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: tok.text,
                lineHeight: 1.1,
              }}
            >
              From product to perfect price
              <br />
              in three steps
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 36,
                left: "calc(16.5% + 0px)",
                right: "calc(16.5%)",
                height: 1,
                background: `linear-gradient(90deg, ${tok.accent}55, ${tok.accent}22, ${tok.accent}55)`,
                zIndex: 0,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 32,
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                {
                  n: "01",
                  title: "Tell us what you're selling",
                  body: "Type the product name. Optionally add the price you're thinking. That's it — no account info, no listing details, no logins.",
                },
                {
                  n: "02",
                  title: "We scan four marketplaces in parallel",
                  body: "PriceScope fires automated browsers at eBay, Amazon, Catch, and Facebook Marketplace. Smart matching filters listings that aren't actually your product. All in about three minutes.",
                },
                {
                  n: "03",
                  title: "Get your answer",
                  body: "See where your price ranks. Median, percentile, distribution chart, and a table of comparable listings with links. Save it as a watchlist to track over time.",
                },
              ].map((s) => (
                <div key={s.n} style={{ textAlign: "center", padding: "0 24px" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      margin: "0 auto 28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: tok.bgCard,
                      border: `2px solid ${tok.accent}`,
                      boxShadow: `0 0 0 6px ${tok.accent}14, 0 16px 40px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SYNE,
                        fontSize: 18,
                        fontWeight: 800,
                        color: tok.accent,
                      }}
                    >
                      {s.n}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: SYNE,
                      fontSize: 20,
                      fontWeight: 700,
                      color: tok.text,
                      marginBottom: 14,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 15, color: tok.textMuted, lineHeight: 1.65 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: "80px 40px", background: tok.bgMid }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
            padding: "64px 48px",
            borderRadius: 24,
            background: tok.bgCard,
            border: `1px solid ${tok.border}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 500,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${tok.accent}12 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontFamily: SYNE,
                fontSize: "clamp(24px, 3.5vw, 40px)",
                fontWeight: 800,
                color: tok.text,
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              Find out what your listing is worth.
            </h2>
            <p style={{ fontSize: 17, color: tok.textMuted, marginBottom: 36 }}>
              Free to try. No credit card. Three minutes from signup to your first report.
            </p>
            <CtaButton
              href={primaryHref}
              label="Start your first scan — it's free →"
              variant="banner"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 40px",
          background: tok.bg,
          borderTop: `1px solid ${tok.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 16, color: tok.textMuted }}
          >
            PriceScope
          </span>
          <span style={{ fontSize: 13, color: tok.textMuted }}>
            © 2026 PriceScope. Know what your product is selling for, everywhere.
          </span>
        </div>
      </footer>
    </div>
  );
}
