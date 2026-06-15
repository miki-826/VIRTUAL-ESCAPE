import type { Metadata, Viewport } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIRTUAL ESCAPE — 残り3分。声で、人間であることを証明せよ。",
  description:
    "電子空間に取り残された人間を救う3分制の人間性認証ゲーム。声・一言・現実音で管理AIの認証を突破せよ。",
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${orbitron.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
