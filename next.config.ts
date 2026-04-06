import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['abridgeable-nonvibratile-brenton.ngrok-free.dev'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
    ],
  },
};

export default nextConfig;
