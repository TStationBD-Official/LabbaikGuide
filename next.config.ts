import type { NextConfig } from "next";

const YT = '"https://www.youtube-nocookie.com" "https://www.youtube.com"';

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    // Geolocation and motion sensors only for our own origin (Qibla, My Hotel); everything else off.
    // The YouTube player (live from the Haramain) may auto-play (muted), go full screen and picture-in-picture.
    value: [
      "camera=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "geolocation=(self)",
      "accelerometer=(self)",
      "gyroscope=(self)",
      "magnetometer=(self)",
      "screen-wake-lock=(self)",
      `autoplay=(self ${YT})`,
      `fullscreen=(self ${YT})`,
      `picture-in-picture=(self ${YT})`,
      `encrypted-media=(self ${YT})`,
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Lets the client tell the service worker to re-cache pages after each deploy.
  env: { NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? `local-${Date.now()}` },
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
