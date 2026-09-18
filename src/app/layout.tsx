import type { Metadata, Viewport } from "next";

import { Providers } from "@/app/providers";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { DemoBar } from "@/components/layout/demo-bar";
import "./globals.css";

export const metadata: Metadata = {
  // Fictional business, invented contact details: never a search result.
  robots: { index: false, follow: false },
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#f4f8f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <DemoBar demo="Nile Dental Studio" slug="dental" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
