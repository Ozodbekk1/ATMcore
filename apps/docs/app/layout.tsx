import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const g = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const gm = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATM CORE — Documentation",
  description: "ATM CORE platforma hujjatlari",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${g.variable} ${gm.variable}`}>
      <body>{children}</body>
    </html>
  );
}
