import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server.js for Docker
  output: "standalone",

  // Keep better-sqlite3 as an external (native module — not bundled)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
