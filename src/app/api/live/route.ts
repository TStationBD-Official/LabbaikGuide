import { NextResponse } from "next/server";
import { LIVE_CHANNELS } from "@/data/live";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { liveVideoFor } from "@/server/live/youtube";

/**
 * GET /api/live — the stream that is live now on each official Haramain channel.
 * `videoId: null` = couldn't confirm one (the app then uses YouTube's channel live embed);
 * `ok: false` = lookup failed for that channel.
 */
export async function GET(req: Request) {
  const limit = rateLimit(`live:${clientKey(req)}`, { capacity: 20, refillPerSec: 0.5 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const channels = await Promise.all(
    LIVE_CHANNELS.map(async (c) => {
      try {
        const v = await liveVideoFor(c.channelId);
        return { id: c.id, ok: true, videoId: v?.videoId ?? null, title: v?.title ?? null };
      } catch {
        return { id: c.id, ok: false, videoId: null, title: null };
      }
    }),
  );
  return NextResponse.json(
    { channels, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600" } },
  );
}
