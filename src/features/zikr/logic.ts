import { z } from "zod";

/**
 * Pure zikr logic — no React, no storage — so it can be unit-tested.
 */
export type UndoEntry =
  | { type: "inc"; id: string; day: string }
  | { type: "reset"; id: string; previous: number };

export type ZikrCounts = Record<string, number>;
export type DailyHistory = Record<string, number>; // YYYY-MM-DD → total taps

export const MAX_UNDO = 100;
export const MAX_COUNT = 1_000_000;

export function applyIncrement(
  counts: ZikrCounts,
  history: DailyHistory,
  undo: UndoEntry[],
  id: string,
  day: string,
) {
  const current = counts[id] ?? 0;
  if (current >= MAX_COUNT) return { counts, history, undo };
  return {
    counts: { ...counts, [id]: current + 1 },
    history: { ...history, [day]: (history[day] ?? 0) + 1 },
    undo: [...undo, { type: "inc", id, day } as UndoEntry].slice(-MAX_UNDO),
  };
}

export function applyReset(counts: ZikrCounts, undo: UndoEntry[], id: string) {
  const previous = counts[id] ?? 0;
  if (previous === 0) return { counts, undo };
  return {
    counts: { ...counts, [id]: 0 },
    undo: [...undo, { type: "reset", id, previous } as UndoEntry].slice(-MAX_UNDO),
  };
}

/** Undo the most recent action for `id` (or any id when omitted). */
export function applyUndo(counts: ZikrCounts, history: DailyHistory, undo: UndoEntry[], id?: string) {
  let idx = -1;
  for (let i = undo.length - 1; i >= 0; i--) {
    if (!id || undo[i].id === id) {
      idx = i;
      break;
    }
  }
  if (idx < 0) return { counts, history, undo, undone: false };
  const entry = undo[idx];
  const rest = [...undo.slice(0, idx), ...undo.slice(idx + 1)];
  if (entry.type === "reset") {
    return { counts: { ...counts, [entry.id]: entry.previous }, history, undo: rest, undone: true };
  }
  const c = Math.max(0, (counts[entry.id] ?? 0) - 1);
  const h = Math.max(0, (history[entry.day] ?? 0) - 1);
  return {
    counts: { ...counts, [entry.id]: c },
    history: { ...history, [entry.day]: h },
    undo: rest,
    undone: true,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Statistics from the daily history, using the device's local calendar. */
export function computeStats(history: DailyHistory, now: Date) {
  const today = keyOf(now);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yesterday = keyOf(y);

  let week = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    week += history[keyOf(d)] ?? 0;
  }
  const monthPrefix = today.slice(0, 7);
  let month = 0;
  let total = 0;
  for (const [k, v] of Object.entries(history)) {
    total += v;
    if (k.startsWith(monthPrefix)) month += v;
  }
  return { today: history[today] ?? 0, yesterday: history[yesterday] ?? 0, week, month, total };
}

export const localDayKey = keyOf;

/** Validation for user-created zikr. All text is rendered as text (never HTML). */
export const CustomZikrInput = z.object({
  name: z.string().trim().min(1, "errName").max(80, "errName"),
  arabic: z.string().trim().max(500, "errLength"),
  pronunciation: z.string().trim().max(500, "errLength"),
  meaning: z.string().trim().max(1000, "errLength"),
  target: z.coerce.number().int("errTarget").min(1, "errTarget").max(100_000, "errTarget"),
});
export type CustomZikrInput = z.infer<typeof CustomZikrInput>;

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
