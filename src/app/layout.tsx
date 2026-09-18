import type { Metadata, Viewport } from "next";

import { Providers } from "@/app/providers";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { DemoBar } from "@/components/layout/demo-bar";
import { demoJsonLd, demoMetadata } from "@/lib/desert-launch";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  // Share preview, robots, canonical host and the link back to the studio.
  ...demoMetadata(),
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
        <DemoBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(demoJsonLd()) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
