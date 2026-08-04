import {
  Bricolage_Grotesque,
  IBM_Plex_Sans_Arabic,
  Instrument_Sans,
} from "next/font/google";

/**
 * Bricolage Grotesque carries every heading — a grotesque with enough
 * character to avoid the default-sans look, still calm at large sizes.
 */
export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

/** Instrument Sans handles reading text and UI: neutral, warm, high x-height. */
export const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

/** Used only for the Arabic wordmark in the header and footer. */
export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-arabic",
});

export const fontVariables = [
  displayFont.variable,
  bodyFont.variable,
  arabicFont.variable,
].join(" ");
