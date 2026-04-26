"use client";

import type { ReactNode } from "react";
import { tok, SYNE } from "./tokens";

type Props = {
  icon: ReactNode;
  title: string;
  desc: string;
};

export function FeatureCard({ icon, title, desc }: Props) {
  return (
    <div
      style={{
        background: tok.bgCard,
        border: `1px solid ${tok.border}`,
        borderRadius: 16,
        padding: "28px 28px",
        transition: "border-color 0.25s, transform 0.2s, box-shadow 0.25s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = tok.accent + "55";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = tok.border;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: tok.accent + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tok.accent,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: SYNE,
          fontSize: 16,
          fontWeight: 700,
          color: tok.text,
          marginBottom: 10,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, color: tok.textMuted, lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
