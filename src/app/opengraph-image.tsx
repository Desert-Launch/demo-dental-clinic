import { ImageResponse } from "next/og";

import { DEMO } from "@/lib/demo-site";
import { OG_TITLE } from "@/lib/desert-launch";

/**
 * The share-preview card. Deliberately in the studio's navy and gold rather
 * than the demo's own palette: a link forwarded on WhatsApp should read as
 * "a demo by Desert Launch", which is the thing being sold.
 *
 * Latin text only — the default font bundled with ImageResponse has no
 * Arabic glyphs, so an Arabic-first demo shows its Latin name here.
 */
export const alt = OG_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // Satori needs a single text child per box, so the line is one string.
  const kind = DEMO.kind.charAt(0).toUpperCase() + DEMO.kind.slice(1);
  const tagline = `${kind} website + staff dashboard · ${DEMO.city}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#c9cfdb" }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "#f5c542" }} />
          <span>Demo by Desert Launch</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2 }}>{DEMO.latinName}</div>
          <div style={{ fontSize: 34, color: "#f5c542" }}>{tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#97a3b6" }}>
          <span>Fictional business · sample data · nothing is kept</span>
          <span style={{ color: "#f8fafc" }}>desertlaunch.dev/demos</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
