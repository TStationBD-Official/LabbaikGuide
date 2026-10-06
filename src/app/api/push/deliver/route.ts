import { NextResponse } from "next/server";
import { deliverUrl, pushEnabled, sendPush, verifyQStash } from "@/server/push/service";
import { DeliverBodySchema } from "@/types/push";

/** Called by QStash at the scheduled time. Only signed QStash requests are accepted. */
export async function POST(req: Request) {
  if (!pushEnabled()) return NextResponse.json({ error: "push_disabled" }, { status: 503 });
  const body = await req.text();
  // Verify against the URL we asked QStash to call (proxies may rewrite req.url).
  const ok = await verifyQStash(req.headers.get("upstash-signature"), body, deliverUrl());
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 200 }); // don't make QStash retry garbage
  }
  const parsed = DeliverBodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 200 });
  const result = await sendPush(parsed.data.subscription, parsed.data.payload);
  // "gone" (unsubscribed / expired) is final: 200 so QStash stops retrying. Transient failures → 502 → retry.
  return NextResponse.json({ result }, { status: result === "failed" ? 502 : 200 });
}
