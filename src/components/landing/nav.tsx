"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tok, SYNE, DM_SANS } from "./tokens";

type Props = { isSignedIn: boolean };

export function Nav({ isSignedIn }: Props) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ctaHref = isSignedIn ? "/dashboard" : "/signup";
  const ctaLabel = isSignedIn ? "Dashboard" : "Start your first scan";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        background: scrolled ? "rgba(12,12,13,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${tok.border}` : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke={tok.accent} strokeWidth="2" />
          <circle cx="14" cy="14" r="5" fill={tok.accent} />
          <line x1="14" y1="1" x2="14" y2="6" stroke={tok.accent} strokeWidth="2" />
          <line x1="14" y1="22" x2="14" y2="27" stroke={tok.accent} strokeWidth="2" />
          <line x1="1" y1="14" x2="6" y2="14" stroke={tok.accent} strokeWidth="2" />
          <line x1="22" y1="14" x2="27" y2="14" stroke={tok.accent} strokeWidth="2" />
        </svg>
        <span
          style={{
            fontFamily: SYNE,
            fontWeight: 800,
            fontSize: 18,
            color: tok.text,
            letterSpacing: "-0.02em",
          }}
        >
          PriceScope
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a
          href="#features"
          style={{
            color: tok.textMuted,
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 14px",
            borderRadius: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = tok.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = tok.textMuted)}
        >
          Features
        </a>
        <a
          href="#how"
          style={{
            color: tok.textMuted,
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 14px",
            borderRadius: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = tok.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = tok.textMuted)}
        >
          How it works
        </a>
        <Link
          href={ctaHref}
          style={{
            background: tok.accent,
            color: "#000",
            border: "none",
            cursor: "pointer",
            padding: "9px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: DM_SANS,
            textDecoration: "none",
            display: "inline-block",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {ctaLabel}
        </Link>
      </div>
    </nav>
  );
}
