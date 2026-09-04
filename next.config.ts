import type { NextConfig } from "next";

const API_SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${API_SERVER_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;

