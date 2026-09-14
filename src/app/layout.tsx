import type { Metadata, Viewport } from "next";
import "@sun-typeface/suit/fonts/variable/woff2/SUIT-Variable.css";

import { AnalyticsConsent } from "@/components/analytics/analytics-consent";
import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

import "./globals.css";
import { isDemoPreview } from "@/lib/content/demo";

export const metadata: Metadata = {
  // Search and social metadata always identify the public canonical site,
  // never a temporary Preview URL used by authentication callbacks.
  metadataBase: new URL(siteConfig.url),
  ...createPageMetadata({
    title: "Won Design Studio | Digital Experience Partner",
    description: siteConfig.description,
    path: "/",
    absoluteTitle: true,
  }),
  title: {
    default: "Won Design Studio | Digital Experience Partner",
    template: "%s | Won Design Studio",
  },
  applicationName: siteConfig.name,
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        {isDemoPreview() && <div style={{ position: "fixed", bottom: 12, left: 12, zIndex: 9999, background: "#111", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 14 }}>로컬 미리보기 · 이미지와 로고는 더미입니다</div>}
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기
        </a>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
