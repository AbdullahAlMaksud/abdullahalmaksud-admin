import type { NextConfig } from "next";

const API_SERVER_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const envAssetRemotePattern = (() => {
  const raw = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      ...(envAssetRemotePattern ? [envAssetRemotePattern] : []),
      {
        protocol: "https",
        hostname: "assets.abdullahalmaksud.com",
      },
      {
        protocol: "https",
        hostname: "assets-dev.abdullahalmaksud.com",
      },
      {
        protocol: "https",
        hostname: "*.abdullahalmaksud.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_SERVER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
