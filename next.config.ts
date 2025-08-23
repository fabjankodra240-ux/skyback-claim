import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don’t fail the Vercel build on ESLint errors
    ignoreDuringBuilds: true,
  },
  // If you hit TypeScript build errors and just want to ship, uncomment:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
