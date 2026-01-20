import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment
  output: "standalone",

  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Logging for development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
