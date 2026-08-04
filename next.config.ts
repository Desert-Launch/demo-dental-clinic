import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a sales demo — the dev overlay badge sits on top of the admin
  // sidebar and has no place in a walkthrough.
  devIndicators: false,
  // The demo sits beside sibling lockfiles, so pin the workspace root instead
  // of letting Turbopack infer it.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
