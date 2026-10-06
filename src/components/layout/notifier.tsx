"use client";

import { useEffect, useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { LOCATIONS } from "@/config/locations";
import { ZIKR_CATALOG } from "@/data/zikr/after-salah";
import { ymdInZone } from "@/features/prayer/calendar";
import { calculatePrayerDay, SALAH } from "@/features/prayer/times";
import { computeReminders, type Reminder } from "@/features/zikr/reminders";
import { syncPushSchedule } from "@/services/push-client";
import { useNotificationStore } from "@/stores/notification-store";
import { progressKey, usePlanStore, type ZikrPlan } from "@/stores/zikr-plan-store";
import { useZikrStore } from "@/stores/zikr-store";
import { lt } from "@/types/content";

const LEAD_MS = 10 * 60_000;
const IN_APP_WINDOW_MS = 24 * 60 * 60 * 1000;

async function notify(title: string, body: string, tag: string, url = "/prayer") {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, tag, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", data: { url } });
    else new Notification(title, { body, tag });
  } catch {
    /* notifications are best-effort */
  }
}

/** Localised reminder text for a plan. */
export function usePlanText() {
  const { t, contentLocale, formatNumber } = useI18n();
  const custom = useZikrStore((s) => s.custom);
  return useMemo(() => {
    const byId = new Map([...ZIKR_CATALOG, ...custom].map((z) => [z.id, z]));
    const planName = (plan: ZikrPlan) =>
      plan.builtIn && plan.trigger.type === "salah"
        ? t("zikrPlan.afterSalah", { salah: t(`prayer.${plan.trigger.salah[0]}`) })
        : (plan.name ?? t("zikrPlan.untitled"));
    const summary = (plan: ZikrPlan) =>
      plan.items
        .slice(0, 4)
        .map((i) => {
          const z = byId.get(i.zikrId);
          return z ? `${lt(z.name, contentLocale)} ×${formatNumber(i.count)}` : null;
        })
        .filter(Boolean)
        .join(" · ") + (plan.items.length > 4 ? " …" : "");
    return {
      planName,
      summary,
      title: (plan: ZikrPlan, salah: string | null) =>
        !plan.builtIn && salah ? `${planName(plan)} · ${t(`prayer.${salah}` as "prayer.fajr")}` : planName(plan),
      body: (plan: ZikrPlan) => `${summary(plan)} — ${t("zikrPlan.tapToStart")}`,
    };
  }, [t, contentLocale, formatNumber, custom]);
}

/**
 * Reminders. Prayer alerts run while the app is open. Zikr-plan reminders use
 * background Web Push when the server is configured (works with the app closed);
 * otherwise they fall back to in-app timers. Nothing runs until the user has
 * chosen a mode AND granted permission.
 */
export function Notifier() {
  const { t } = useI18n();
  const mode = useNotificationStore((s) => s.mode);
  const pushState = useNotificationStore((s) => s.pushState);
  const location = usePrefs((s) => s.location);
  const plans = usePlanStore((s) => s.plans);
  const progress = usePlanStore((s) => s.progress);
  const text = usePlanText();

  // Prayer-time alerts (in-app).
  useEffect(() => {
    if (mode !== "all" && mode !== "prayer") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = () => {
      timers.splice(0).forEach(clearTimeout);
      const now = Date.now();
      const day = calculatePrayerDay(location, ymdInZone(new Date()));
      for (const p of day.prayers.filter((x) => SALAH.includes(x.name))) {
        const name = t(p.name === "dhuhr" && day.isFriday ? "prayer.jumuah" : `prayer.${p.name}`);
        const at = p.adhan.getTime();
        if (at - LEAD_MS > now) timers.push(setTimeout(() => notify(name, `${t("prayer.startsIn")} 10′ · ${t(LOCATIONS[location].mosqueKey)}`, `pre-${p.name}`), at - LEAD_MS - now));
        if (at > now) timers.push(setTimeout(() => notify(name, `${t("prayer.prayerNow")} · ${t(LOCATIONS[location].mosqueKey)}`, `now-${p.name}`), at - now));
      }
    };
    schedule();
    const refresh = setInterval(schedule, 30 * 60_000); // also covers midnight rollover
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(refresh);
    };
  }, [mode, location, t]);

  // Zikr-plan reminders.
  useEffect(() => {
    const wantsZikr = mode === "all" || mode === "zikr";
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const build = (): Reminder[] =>
      wantsZikr
        ? computeReminders({
            plans,
            location,
            now: Date.now(),
            days: 3,
            title: text.title,
            body: text.body,
            done: (id, day) => Boolean(usePlanStore.getState().progress[progressKey(id, day)]?.done),
          })
        : [];

    // Background push (also clears the server schedule when reminders are turned off).
    const sync = setTimeout(() => void syncPushSchedule(build()), 1500);

    // In-app fallback when background push isn't active.
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (wantsZikr && pushState !== "active") {
      const now = Date.now();
      for (const r of build()) {
        if (r.at - now > IN_APP_WINDOW_MS) break;
        timers.push(setTimeout(() => notify(r.title, r.body, r.tag, r.url), r.at - now));
      }
    }
    const daily = setInterval(() => void syncPushSchedule(build()), 6 * 60 * 60 * 1000);
    return () => {
      clearTimeout(sync);
      clearInterval(daily);
      timers.forEach(clearTimeout);
    };
  }, [mode, location, plans, progress, text, pushState]);

  return null;
}
