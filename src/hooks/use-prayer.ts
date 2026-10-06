"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { APP_CONFIG } from "@/config/app";
import type { LocationId } from "@/config/locations";
import { ymdInZone, ymdKey } from "@/features/prayer/calendar";
import { calculatePrayerDay, nextPrayerInfo, tomorrowOf, type PrayerDay } from "@/features/prayer/times";
import { apiGet } from "@/services/api-client";
import { HaramainScheduleSchema, type HaramainSchedule } from "@/types/haramain";
import { z } from "zod";
import { useOnline } from "./use-online";

const TimeSchema = z.object({ now: z.number() });

/**
 * Ticking clock corrected by the server's clock when the device clock is
 * significantly wrong. Re-syncs immediately when the tab becomes visible
 * (background tabs throttle timers).
 */
export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  const offset = useQuery({
    queryKey: ["server-time"],
    queryFn: async ({ signal }) => {
      const t0 = Date.now();
      const r = await apiGet("/api/time", TimeSchema, { signal, timeoutMs: 5000 });
      const t1 = Date.now();
      return r.now - (t0 + t1) / 2;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
  const skew = offset.data ?? 0;
  const applied = Math.abs(skew) > APP_CONFIG.prayer.clockSkewWarnMs ? skew : 0;

  useEffect(() => {
    const tick = () => setNow(new Date(Date.now() + applied));
    tick();
    const id = setInterval(tick, intervalMs);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [applied, intervalMs]);

  return { now, skewMs: applied };
}

function mergeOfficial(day: PrayerDay, s: HaramainSchedule | undefined): PrayerDay {
  if (!s || s.status !== "official" || s.date !== ymdKey(day.date)) return day;
  return {
    ...day,
    prayers: day.prayers.map((p) => {
      const o = s.prayers.find((x) => x.name === p.name);
      if (!o) return p;
      return {
        ...p,
        adhan: o.adhan ? new Date(o.adhan) : p.adhan,
        iqamah: o.iqamah ? new Date(o.iqamah) : null,
        imam: o.imam,
        muezzin: o.muezzin,
      };
    }),
  };
}

export function useHaramainSchedule(location: LocationId, dateKey: string | null) {
  return useQuery({
    queryKey: ["haramain", location, dateKey],
    queryFn: ({ signal }) =>
      apiGet(`/api/haramain/schedule?location=${location}&date=${dateKey}`, HaramainScheduleSchema, { signal }),
    enabled: dateKey !== null,
    staleTime: APP_CONFIG.cache.scheduleStaleMs,
    refetchInterval: APP_CONFIG.prayer.refreshIntervalMs,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}

/**
 * Today's + tomorrow's schedule for a Haram location, recalculated
 * automatically when the Riyadh date changes (midnight).
 */
export function usePrayerData(location: LocationId) {
  const { now, skewMs } = useClock();
  const online = useOnline();
  const today = now ? ymdInZone(now) : null;
  const todayKey = today ? ymdKey(today) : null;

  const schedule = useHaramainSchedule(location, todayKey);

  const days = useMemo(() => {
    if (!today) return null;
    const t = mergeOfficial(calculatePrayerDay(location, today), schedule.data);
    const tm = calculatePrayerDay(location, tomorrowOf(today));
    return { today: t, tomorrow: tm };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute per calendar day, not per tick
  }, [location, todayKey, schedule.data]);

  const info = days && now ? nextPrayerInfo(now, days.today, days.tomorrow) : null;

  const s = schedule.data;
  const staleSchedule = Boolean(
    s && now && (new Date(s.expiresAt).getTime() < now.getTime() - APP_CONFIG.cache.scheduleStaleMs || !online),
  );

  return { now, skewMs, days, info, schedule, staleSchedule, online };
}
