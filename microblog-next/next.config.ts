import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
