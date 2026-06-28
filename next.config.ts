import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — a stray lockfile in a parent dir
  // was making Next infer the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
