import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Google account profile photos served via Firebase Auth user.photoURL.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Firebase Storage — uploaded hero images.
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
