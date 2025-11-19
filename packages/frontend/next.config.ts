import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typescript: {
    // Fail build on TypeScript errors (same as deployment)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
