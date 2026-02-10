import type { NextConfig } from "next";
import { configs } from "./configs";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: configs.ALLOWED_ORIGINS,
    }
  },
};

export default nextConfig;
