import type { ReactNode } from "react";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "PriceScope — Know what your product is selling for, everywhere",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          background: "#0c0c0d",
          color: "#f0ede8",
          WebkitFontSmoothing: "antialiased",
          overflowX: "hidden",
          margin: 0,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
