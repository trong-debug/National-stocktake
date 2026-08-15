import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  adapterPath: require.resolve('@next-community/adapter-vercel'),
};

export default nextConfig;
