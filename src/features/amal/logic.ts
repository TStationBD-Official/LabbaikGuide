import { AMAL_ITEMS, type AmalCounter, type AmalItem, type AmalKind } from "@/data/amal/items";
import { HARAM_TZ, ymdInZone, ymdKey } from "@/features/prayer/calendar";

/** One day's record. `done` maps item id → time it was ticked; `auto` marks ticks that came from elsewhere in the app. */
export type AmalDay = {
  done: Record<string, number>;
  auto?: Record<string, 1>;
  counts?: Partial<Record<AmalCounter, number>>;
  /** Not praying today for a valid reason: prayer items don't count towards the score. */
  excused?: boolean;
};
export type AmalSettings = { enabled: Record<string, boolean>; goals: Record<string, number> };

/** Days follow the Haramain calendar (Riyadh), like prayer times and zikr plans. */
export function amalDayKey(now: Date = new Date()): string {
  return ymdKey(ymdInZone(now, HARAM_TZ));
}
export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}
export function shiftKey(key: string, days: number): string {
  const d = parseKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const isFridayKey = (key: string) => parseKey(key).getUTCDay() === 5;

const SALAT_IDS = new Set(["fajr-sunnah", "dhuhr-sunnah-before", "asr-sunnah-before", "dhuhr-sunnah-after", "maghrib-sunnah-after", "isha-sunnah-after", "duha", "witr", "tahajjud", "jumuah-early"]);
/** Prayer items (left out of the score on an excused day). */
export const isSalat = (i: AmalItem) => i.kind === "fard" || SALAT_IDS.has(i.id);

export const isEnabled = (i: AmalItem, s: AmalSettings) => (i.kind === "fard" ? true : (s.enabled[i.id] ?? !i.optional));
export const goalOf = (i: AmalItem, s: AmalSettings) => (i.goal ? Math.max(1, Math.round(s.goals[i.id] ?? i.goal)) : 0);

/** Items that apply on a given day with these settings (Friday items only on Fridays…). */
export function itemsFor(key: string, s: AmalSettings, all: AmalItem[] = AMAL_ITEMS): AmalItem[] {
  const fri = isFridayKey(key);
  return all.filter((i) => (i.friday ? fri : i.notFriday ? !fri : true) && isEnabled(i, s));
}

export function countOf(i: AmalItem, day: AmalDay | undefined): number {
  return i.auto?.type === "count" ? (day?.counts?.[i.auto.counter] ?? 0) : 0;
}
export function isDone(i: AmalItem, day: AmalDay | undefined, s: AmalSettings): boolean {
  if (!day) return false;
  if (day.done[i.id]) return true;
  const g = goalOf(i, s);
  return g > 0 && countOf(i, day) >= g;
}

export type DayScore = {
  key: string;
  /** 0–1 weighted completion. */
  pct: number;
  doneWeight: number;
  totalWeight: number;
  doneItems: number;
  totalItems: number;
  fardDone: number;
  fardTotal: number;
  excused: boolean;
};

export function scoreDay(key: string, day: AmalDay | undefined, s: AmalSettings, all: AmalItem[] = AMAL_ITEMS): DayScore {
  const excused = Boolean(day?.excused);
  const items = itemsFor(key, s, all).filter((i) => !(excused && isSalat(i)));
  let doneWeight = 0;
  let totalWeight = 0;
  let doneItems = 0;
  let fardDone = 0;
  let fardTotal = 0;
  for (const i of items) {
    const d = isDone(i, day, s);
    totalWeight += i.weight;
    if (d) {
      doneWeight += i.weight;
      doneItems++;
    }
    if (i.kind === "fard") {
      fardTotal++;
      if (d) fardDone++;
    }
  }
  return { key, pct: totalWeight ? doneWeight / totalWeight : 0, doneWeight, totalWeight, doneItems, totalItems: items.length, fardDone, fardTotal, excused };
}

/** Day keys from `from` to `to` inclusive. */
export function keysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to && out.length < 800; k = shiftKey(k, 1)) out.push(k);
  return out;
}

/** Scores for a range; days before tracking started (or in the future) are `null`. */
export function rangeScores(days: Record<string, AmalDay>, s: AmalSettings, from: string, to: string, today: string, firstDay: string | null): (DayScore | null)[] {
  return keysBetween(from, to).map((k) => (k > today || !firstDay || k < firstDay ? null : scoreDay(k, days[k], s)));
}

export type RangeSummary = { days: number; avg: number; fardRate: number; perfect: number; best: DayScore | null; doneItems: number };
export function summarize(scores: (DayScore | null)[]): RangeSummary {
  const real = scores.filter((x): x is DayScore => x !== null);
  const fardTotal = real.reduce((a, x) => a + x.fardTotal, 0);
  const best = real.reduce<DayScore | null>((b, x) => (!b || x.pct > b.pct ? x : b), null);
  return {
    days: real.length,
    avg: real.length ? real.reduce((a, x) => a + x.pct, 0) / real.length : 0,
    fardRate: fardTotal ? real.reduce((a, x) => a + x.fardDone, 0) / fardTotal : 0,
    perfect: real.filter((x) => x.totalItems > 0 && x.doneItems === x.totalItems).length,
    best,
    doneItems: real.reduce((a, x) => a + x.doneItems, 0),
  };
}

/** Days in a row (ending today, or yesterday if today isn't finished yet) with every fard prayer ticked. */
export function fardStreak(days: Record<string, AmalDay>, s: AmalSettings, today: string): { current: number; best: number } {
  const full = (k: string) => {
    const d = days[k];
    if (d?.excused) return true; // an excused day doesn't break the chain
    const sc = scoreDay(k, d, s);
    return sc.fardTotal > 0 && sc.fardDone === sc.fardTotal;
  };
  let current = 0;
  let k = full(today) ? today : shiftKey(today, -1);
  while (days[k] && full(k)) {
    current++;
    k = shiftKey(k, -1);
  }
  let best = 0;
  let run = 0;
  const keys = Object.keys(days).sort();
  let prev: string | null = null;
  for (const key of keys) {
    run = full(key) ? (prev !== null && shiftKey(prev, 1) === key && run > 0 ? run + 1 : 1) : 0;
    best = Math.max(best, run);
    prev = key;
  }
  return { current, best: Math.max(best, current) };
}

const EMPTY_DAY: AmalDay = { done: {} };

/** Tracked day keys in a range (from the first day of use, not in the future). */
export function trackedKeys(from: string, to: string, today: string, firstDay: string | null): string[] {
  if (!firstDay) return [];
  const a = from < firstDay ? firstDay : from;
  const b = to > today ? today : to;
  return a > b ? [] : keysBetween(a, b);
}

export type KindStat = { kind: AmalKind; done: number; total: number };
/** How often each kind of deed was done in a range (days with data only). */
export function kindBreakdown(days: Record<string, AmalDay>, s: AmalSettings, keys: string[]): KindStat[] {
  const map = new Map<AmalKind, KindStat>();
  for (const k of keys) {
    const d = days[k] ?? EMPTY_DAY;
    for (const i of itemsFor(k, s)) {
      if (d.excused && isSalat(i)) continue;
      const st = map.get(i.kind) ?? { kind: i.kind, done: 0, total: 0 };
      st.total++;
      if (isDone(i, d, s)) st.done++;
      map.set(i.kind, st);
    }
  }
  const order: AmalKind[] = ["fard", "sunnah", "nafl", "adhkar", "dua", "quran"];
  return order.map((k) => map.get(k)).filter((x): x is KindStat => Boolean(x));
}

export type ItemStat = { item: AmalItem; done: number; total: number };
export function itemStats(days: Record<string, AmalDay>, s: AmalSettings, keys: string[]): ItemStat[] {
  const map = new Map<string, ItemStat>();
  for (const k of keys) {
    const d = days[k] ?? EMPTY_DAY;
    for (const i of itemsFor(k, s)) {
      if (d.excused && isSalat(i)) continue;
      const st = map.get(i.id) ?? { item: i, done: 0, total: 0 };
      st.total++;
      if (isDone(i, d, s)) st.done++;
      map.set(i.id, st);
    }
  }
  return [...map.values()];
}

export type Recommendation =
  | { type: "start" }
  | { type: "fard"; item: AmalItem; done: number; total: number }
  | { type: "improve"; item: AmalItem; done: number; total: number }
  | { type: "kahf" }
  | { type: "consistency"; streak: number }
  | { type: "great"; avg: number };

/**
 * Up to `max` suggestions from the last 7 days: missed fard first, then the most-missed
 * sunnah/adhkar/Qur'an (weightier first), Surah al-Kahf on Thursday/Friday, and encouragement.
 */
export function recommend(days: Record<string, AmalDay>, s: AmalSettings, today: string, firstDay: string | null, max = 3): Recommendation[] {
  // The finished days of the last week (today is still in progress).
  const keys = trackedKeys(shiftKey(today, -7), shiftKey(today, -1), today, firstDay);
  const kahfItem = AMAL_ITEMS.find((i) => i.id === "kahf");
  const kahfDue = (isFridayKey(today) && !(kahfItem && isDone(kahfItem, days[today], s))) || isFridayKey(shiftKey(today, 1));
  if (keys.length === 0) return kahfDue ? [{ type: "start" }, { type: "kahf" }] : [{ type: "start" }];
  const out: Recommendation[] = [];
  const stats = itemStats(days, s, keys);
  const fard = stats.filter((x) => x.item.kind === "fard" && x.done < x.total).sort((a, b) => a.done / a.total - b.done / b.total);
  if (fard[0]) out.push({ type: "fard", item: fard[0].item, done: fard[0].done, total: fard[0].total });
  if (kahfDue) out.push({ type: "kahf" });

  const others = stats
    .filter((x) => x.item.kind !== "fard" && x.item.grade !== "weak" && !x.item.friday && x.done / x.total < 0.6)
    .sort((a, b) => a.done / a.total - b.done / b.total || b.item.weight - a.item.weight);
  for (const o of others) {
    if (out.length >= max) break;
    out.push({ type: "improve", item: o.item, done: o.done, total: o.total });
  }
  if (out.length < max) {
    const sum = summarize(keys.map((k) => scoreDay(k, days[k], s)));
    const streak = fardStreak(days, s, today).current;
    if (sum.avg >= 0.85) out.push({ type: "great", avg: sum.avg });
    else out.push({ type: "consistency", streak });
  }
  return out.slice(0, max);
}
