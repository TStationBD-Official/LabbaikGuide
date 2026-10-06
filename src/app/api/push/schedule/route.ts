import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { cancelReminders, pushEnabled, PushError, scheduleReminders } from "@/server/push/service";
import { ScheduleRequestSchema } from "@/types/push";

/** QStash free plan: max delay 7 days. */
const MAX_AHEAD_MS = 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000;

/**
 * POST { subscription, items: [{ at, title, body, url, tag }], cancel: [messageId] }
 * Replaces this device's scheduled reminders. Nothing is stored on our side.
 */
export async function POST(req: Request) {
  if (!pushEnabled()) return NextResponse.json({ error: "push_disabled" }, { status: 503 });
  const limit = rateLimit(`push:${clientKey(req)}`, { capacity: 6, refillPerSec: 1 / 60 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const text = await req.text();
  if (text.length > 64_000) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = ScheduleRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const now = Date.now();
  const items = parsed.data.items.filter((i) => i.at > now + 30_000 && i.at < now + MAX_AHEAD_MS);
  try {
    await cancelReminders(parsed.data.cancel);
    const ids = await scheduleReminders(parsed.data.subscription, items);
    return NextResponse.json({ ids, scheduled: ids.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof PushError ? e.status : 502;
    return NextResponse.json({ error: "schedule_failed" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
