import type { LocationId } from "@/config/locations";
import { addDays, ymdInZone, ymdKey, type YMD } from "@/features/prayer/calendar";
import { calculatePrayerDay } from "@/features/prayer/times";
import type { ZikrPlan } from "@/stores/zikr-plan-store";

export type Reminder = { at: number; title: string; body: string; url: string; tag: string; planId: string; day: string };

/** Makkah/Madinah are UTC+3 all year (no DST). */
const RIYADH_OFFSET_H = 3;

/** Instant of HH:MM Makkah time on a given Makkah date. */
export function makkahTime(d: YMD, hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return Date.UTC(d.year, d.month - 1, d.day, h - RIYADH_OFFSET_H, m);
}

/**
 * All upcoming plan reminders within `days` days (Haram prayer times, Umm al-Qura).
 * Pure: unit-tested, used both for in-app timers and for background push.
 */
export function computeReminders({
  plans,
  location,
  now,
  days = 3,
  title,
  body,
  done,
}: {
  plans: ZikrPlan[];
  location: LocationId;
  now: number;
  days?: number;
  title: (plan: ZikrPlan, salah: string | null) => string;
  body: (plan: ZikrPlan) => string;
  /** Skip reminders for plans already completed that day. */
  done?: (planId: string, day: string) => boolean;
}): Reminder[] {
  const out: Reminder[] = [];
  const today = ymdInZone(new Date(now));
  for (let i = 0; i < days; i++) {
    const d = addDays(today, i);
    const dayKey = ymdKey(d);
    const prayerDay = plans.some((p) => p.remind && p.trigger.type === "salah") ? calculatePrayerDay(location, d) : null;
    for (const plan of plans) {
      if (!plan.remind || done?.(plan.id, dayKey)) continue;
      const push = (at: number, salah: string | null) => {
        if (at <= now) return;
        out.push({
          at,
          title: title(plan, salah),
          body: body(plan),
          url: `/zikr?plan=${encodeURIComponent(plan.id)}`,
          tag: `zikr-${plan.id}-${dayKey}${salah ? `-${salah}` : ""}`.slice(0, 64),
          planId: plan.id,
          day: dayKey,
        });
      };
      if (plan.trigger.type === "time") push(makkahTime(d, plan.trigger.time), null);
      else if (prayerDay) {
        for (const s of plan.trigger.salah) {
          const p = prayerDay.prayers.find((x) => x.name === s);
          if (p) push(p.adhan.getTime() + plan.trigger.offsetMin * 60_000, s);
        }
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Stable fingerprint of what would be scheduled (to avoid needless re-scheduling). */
export function remindersHash(list: Reminder[]): string {
  let h = 2166136261;
  const s = list.map((r) => `${r.at}|${r.tag}|${r.title}|${r.body}`).join("\n");
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36) + ":" + list.length;
}
