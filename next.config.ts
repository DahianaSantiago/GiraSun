import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Content-Security-Policy
// ---------------------------------------------------------------------------
// Note: script-src includes 'unsafe-inline' and 'unsafe-eval' because
// Next.js App Router injects inline hydration scripts. A stricter nonce-based
// policy is possible but requires per-request nonce plumbing — deferred.
// The remaining directives (frame-ancestors, object-src, base-uri) meaningfully
// reduce attack surface even with loose script-src.
// ---------------------------------------------------------------------------
const NONE = "'none'";
const SELF = "'self'";

const csp = [
  `default-src ${SELF}`,
  `script-src ${SELF} 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com`,
  `style-src ${SELF} 'unsafe-inline'`,
  `img-src ${SELF} data: blob: https://lh3.googleusercontent.com https://firebasestorage.googleapis.com`,
  `font-src ${SELF}`,
  `connect-src ${SELF} https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com`,
  `frame-src https://accounts.google.com`,
  `object-src ${NONE}`,
  `base-uri ${SELF}`,
  `form-action ${SELF}`,
  `frame-ancestors ${NONE}`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
