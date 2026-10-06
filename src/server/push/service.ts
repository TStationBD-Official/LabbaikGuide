import "server-only";
import webpush from "web-push";
import { Receiver } from "@upstash/qstash";
import { SERVER_CONFIG } from "@/config/server";
import type { PushPayload, PushSubscriptionJSONStrict } from "@/types/push";

/**
 * Background reminders without a database:
 *   client computes the reminder times → /api/push/schedule → one QStash
 *   delayed message per reminder (carrying the push subscription) →
 *   at the time QStash calls /api/push/deliver (signature-verified) → Web Push.
 * The client re-schedules when its plan changes, so nothing is stored here.
 */
const cfg = () => SERVER_CONFIG.push;

export function pushEnabled(): boolean {
  const c = cfg();
  return Boolean(c.vapidPublicKey && c.vapidPrivateKey && c.qstashToken && c.qstashCurrentSigningKey && c.siteUrl);
}

/** The exact callback URL QStash signs (its JWT `sub` claim must match). */
export const deliverUrl = () => `${cfg().siteUrl.replace(/\/$/, "")}/api/push/deliver`;

export class PushError extends Error {
  constructor(public status: number) {
    super(`push ${status}`);
  }
}

async function qstash(path: string, init: RequestInit) {
  const res = await fetch(`${cfg().qstashUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${cfg().qstashToken}`, "content-type": "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new PushError(res.status === 429 ? 429 : 502);
  return res.json().catch(() => null);
}

/** Enqueue reminders; returns QStash message ids (the client keeps them to cancel later). */
export async function scheduleReminders(
  subscription: PushSubscriptionJSONStrict,
  items: (PushPayload & { at: number })[],
): Promise<string[]> {
  if (!items.length) return [];
  const destination = deliverUrl();
  const batch = items.map(({ at, ...payload }) => ({
    destination,
    headers: {
      "Upstash-Not-Before": String(Math.floor(at / 1000)),
      "Upstash-Retries": "2",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription, payload }),
  }));
  const out = (await qstash("/v2/batch", { method: "POST", body: JSON.stringify(batch) })) as { messageId?: string }[] | null;
  return (out ?? []).map((r) => r?.messageId).filter((x): x is string => typeof x === "string");
}

export async function cancelReminders(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    await qstash("/v2/messages", { method: "DELETE", body: JSON.stringify({ messageIds: ids }) });
  } catch {
    /* already delivered or expired — fine */
  }
}

export async function verifyQStash(signature: string | null, body: string, url: string): Promise<boolean> {
  if (!signature) return false;
  const receiver = new Receiver({ currentSigningKey: cfg().qstashCurrentSigningKey, nextSigningKey: cfg().qstashNextSigningKey });
  try {
    return await receiver.verify({ signature, body, url });
  } catch {
    return false;
  }
}

export async function sendPush(subscription: PushSubscriptionJSONStrict, payload: PushPayload): Promise<"sent" | "gone" | "failed"> {
  const c = cfg();
  webpush.setVapidDetails(c.vapidSubject, c.vapidPublicKey, c.vapidPrivateKey);
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60, urgency: "high", topic: payload.tag.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) || undefined });
    return "sent";
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    return status === 404 || status === 410 ? "gone" : "failed";
  }
}
