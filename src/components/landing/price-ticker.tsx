"use client";

import { useEffect, useState } from "react";
import { tok, SYNE } from "./tokens";

const listings = [
  { platform: "eBay AU", price: "$329", delta: "-3%", up: false },
  { platform: "Amazon AU", price: "$379", delta: "+8%", up: true },
  { platform: "Catch", price: "$359", delta: "+2%", up: true },
  { platform: "Facebook", price: "$280", delta: "-12%", up: false },
];

export function PriceTicker() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % listings.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: tok.bgCard,
        border: `1px solid ${tok.border}`,
        borderRadius: 20,
        padding: "28px 32px",
        width: 340,
        boxShadow: `0 24px 60px rgba(0,0,0,0.08), 0 0 0 1px ${tok.border}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tok.accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontFamily: SYNE,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: tok.accent,
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        Live price scan
      </div>
      <div style={{ fontSize: 13, color: tok.textMuted, marginBottom: 8, fontWeight: 500 }}>
        &quot;Sony WH-1000XM5&quot; · used
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {listings.map((l, i) => (
          <div
            key={l.platform}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 10,
              background: active === i ? `${tok.accent}14` : "transparent",
              border: `1px solid ${active === i ? tok.accent + "44" : tok.border}`,
              transition: "all 0.35s ease",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: tok.text }}>{l.platform}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: SYNE,
                  color: tok.text,
                }}
              >
                {l.price}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 5,
                  background: l.up ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                  color: l.up ? "#34d399" : "#f87171",
                }}
              >
                {l.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 10,
          background: `${tok.accent}18`,
          border: `1px solid ${tok.accent}33`,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: tok.accent,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Median price
        </div>
        <div style={{ fontFamily: SYNE, fontSize: 24, fontWeight: 800, color: tok.accent }}>
          $349
        </div>
        <div style={{ fontSize: 12, color: tok.textMuted, marginTop: 2 }}>
          Across 28 active listings
        </div>
      </div>
    </div>
  );
}
