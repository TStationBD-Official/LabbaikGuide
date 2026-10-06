"use client";

import { useNotificationStore } from "@/stores/notification-store";
import type { Reminder } from "@/features/zikr/reminders";
import { remindersHash } from "@/features/zikr/reminders";

/**
 * Background reminders via Web Push. The server never stores anything: this
 * device sends its upcoming reminders (and the ids of the previous batch to
 * cancel) whenever they change, plus a daily top-up.
 */
let configCache: Promise<{ enabled: boolean; publicKey: string | null }> | null = null;

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

export function getPushConfig() {
  configCache ??= fetch("/api/push/config")
    .then((r) => (r.ok ? r.json() : { enabled: false, publicKey: null }))
    .catch(() => {
      configCache = null;
      return { enabled: false, publicKey: null };
    });
  return configCache;
}

function keyToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function subscription(publicKey: string): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) });
}

const RESYNC_MS = 12 * 60 * 60 * 1000;

/** Make the server-side schedule match `reminders`. Cheap no-op when nothing changed. */
export async function syncPushSchedule(reminders: Reminder[], force = false): Promise<void> {
  const store = useNotificationStore.getState();
  if (!pushSupported()) return store.setPush({ pushState: "unsupported" });
  if (Notification.permission === "denied") return store.setPush({ pushState: "denied" });
  if (Notification.permission !== "granted") return;
  const cfg = await getPushConfig();
  if (!cfg.enabled || !cfg.publicKey) return store.setPush({ pushState: "disabled" });

  const items = reminders.slice(0, 40).map(({ at, title, body, url, tag }) => ({ at, title, body, url, tag }));
  const hash = remindersHash(reminders.slice(0, 40));
  if (!force && store.pushState === "active" && hash === store.pushHash && Date.now() - store.pushSyncedAt < RESYNC_MS) return;

  try {
    const sub = await subscription(cfg.publicKey);
    if (!sub) return store.setPush({ pushState: "error" });
    const res = await fetch("/api/push/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), items, cancel: store.pushIds }),
    });
    if (res.status === 503) return store.setPush({ pushState: "disabled" });
    if (!res.ok) return store.setPush({ pushState: "error" });
    const { ids } = (await res.json()) as { ids: string[] };
    store.setPush({ pushIds: ids, pushHash: hash, pushSyncedAt: Date.now(), pushState: "active" });
  } catch {
    store.setPush({ pushState: "error" });
  }
}

/** Cancel everything scheduled for this device and drop the subscription. */
export async function disablePush(): Promise<void> {
  const store = useNotificationStore.getState();
  try {
    const reg = await navigator.serviceWorker?.ready;
    const sub = await reg?.pushManager.getSubscription();
    if (sub && store.pushIds.length) {
      await fetch("/api/push/schedule", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), items: [], cancel: store.pushIds }),
      }).catch(() => undefined);
    }
    await sub?.unsubscribe();
  } finally {
    store.setPush({ pushIds: [], pushHash: null, pushSyncedAt: 0, pushState: "unknown" });
  }
}
