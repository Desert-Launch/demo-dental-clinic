import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The demo sits beside sibling lockfiles, so pin the workspace root instead
  // of letting Turbopack infer it.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
