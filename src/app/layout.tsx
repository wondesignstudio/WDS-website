import type { Metadata, Viewport } from "next";
import "@sun-typeface/suit/fonts/variable/woff2/SUIT-Variable.css";

import { AnalyticsConsent } from "@/components/analytics/analytics-consent";
import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wondesign.studio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기
        </a>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
