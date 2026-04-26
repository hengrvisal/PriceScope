"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { tok, DM_SANS } from "./tokens";

type Variant = "hero" | "banner";

type Props = {
  href: string;
  label: string;
  variant?: Variant;
};

export function CtaButton({ href, label, variant = "hero" }: Props) {
  const padding = variant === "banner" ? "16px 40px" : "15px 32px";
  const shadow =
    variant === "banner" ? `0 8px 32px ${tok.accent}55` : `0 8px 32px ${tok.accent}44`;

  const style: CSSProperties = {
    background: tok.accent,
    color: "#000",
    border: "none",
    cursor: "pointer",
    padding,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: DM_SANS,
    letterSpacing: "-0.01em",
    textDecoration: "none",
    display: "inline-block",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: shadow,
  };

  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.88";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "none";
      }}
    >
      {label}
    </Link>
  );
}
