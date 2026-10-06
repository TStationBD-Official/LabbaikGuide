"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { LOCATIONS } from "@/config/locations";
import { ymdInZone } from "@/features/prayer/calendar";
import { calculatePrayerDay, SALAH } from "@/features/prayer/times";
import { computeStats, localDayKey } from "@/features/zikr/logic";
import { useNotificationStore } from "@/stores/notification-store";
import { useZikrStore } from "@/stores/zikr-store";

const LEAD_MS = 10 * 60_000;

async function notify(title: string, body: string, tag: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, tag, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
    else new Notification(title, { body, tag });
  } catch {
    /* notifications are best-effort */
  }
}

/**
 * In-app reminders (while the app is open). Only runs after the user has
 * explicitly chosen a mode AND granted browser permission.
 */
export function Notifier() {
  const { t } = useI18n();
  const mode = useNotificationStore((s) => s.mode);
  const location = usePrefs((s) => s.location);

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

  useEffect(() => {
    if (mode !== "all" && mode !== "zikr") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    // Gentle daily reminder in the evening if no zikr has been counted today.
    const id = setInterval(() => {
      const now = new Date();
      if (now.getHours() < 19) return;
      const day = localDayKey(now);
      const { lastZikrReminder, markZikrReminded } = useNotificationStore.getState();
      if (lastZikrReminder === day) return;
      if (computeStats(useZikrStore.getState().history, now).today > 0) return;
      markZikrReminded(day);
      void notify(t("zikr.title"), t("zikr.tapToCount"), "zikr-daily");
    }, 5 * 60_000);
    return () => clearInterval(id);
  }, [mode, t]);

  return null;
}
