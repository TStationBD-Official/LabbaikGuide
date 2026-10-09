import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request CSP with a nonce. Next.js applies the nonce to its own scripts
 * automatically. Audio is allowed from the Quran CDN only; map tiles from
 * OpenFreeMap/OpenStreetMap only; all other API traffic goes through our own origin.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // React renders `style` attributes; nonces cannot cover attributes.
    "style-src 'self' 'unsafe-inline'",
    // Imam/Muezzin photos: normally via our /api/haramain/photo proxy; direct from the source's storage as fallback.
    "img-src 'self' blob: data: https://objectstorage.me-jeddah-1.oraclecloud.com https://upload.wikimedia.org",
    "font-src 'self' data:",
    "media-src 'self' https://verses.quran.com https://*.quranicaudio.com",
    // Map data for "My Hotel": OpenFreeMap vector tiles (OSM raster as fallback).
    "connect-src 'self' https://tiles.openfreemap.org https://tile.openstreetmap.org",
    // Sponsored banner: third-party sites in a sandboxed frame.
    "frame-src https:",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|qcf|_next/static|_next/image|icons|sw.js|offline.html|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
