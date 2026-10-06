/**
 * Pure logic for the Tawaf (7 rounds) and Sa'i (7 lengths) counters.
 */
export const RITUAL_TOTAL = 7;

export type RitualCounter = {
  completed: number; // 0..7
  notes: Record<number, string>; // round/length number (1..7) → note
  past: { completed: number; notes: Record<number, string> }[]; // undo stack
};

export const emptyCounter = (): RitualCounter => ({ completed: 0, notes: {}, past: [] });

const snapshot = (c: RitualCounter) => ({ completed: c.completed, notes: c.notes });
const MAX_PAST = 50;

export function advance(c: RitualCounter): RitualCounter {
  if (c.completed >= RITUAL_TOTAL) return c;
  return { ...c, completed: c.completed + 1, past: [...c.past, snapshot(c)].slice(-MAX_PAST) };
}

export function back(c: RitualCounter): RitualCounter {
  if (c.completed <= 0) return c;
  return { ...c, completed: c.completed - 1, past: [...c.past, snapshot(c)].slice(-MAX_PAST) };
}

export function resetCounter(c: RitualCounter): RitualCounter {
  if (c.completed === 0 && Object.keys(c.notes).length === 0) return c;
  return { completed: 0, notes: {}, past: [...c.past, snapshot(c)].slice(-MAX_PAST) };
}

export function undo(c: RitualCounter): RitualCounter {
  const prev = c.past[c.past.length - 1];
  if (!prev) return c;
  return { ...prev, past: c.past.slice(0, -1) };
}

export function setNote(c: RitualCounter, n: number, text: string): RitualCounter {
  const clean = text.slice(0, 280);
  const notes = { ...c.notes };
  if (clean.trim()) notes[n] = clean;
  else delete notes[n];
  return { ...c, notes };
}

/** The round/length currently being performed (1..7), or 7 when complete. */
export const currentNumber = (c: RitualCounter) => Math.min(c.completed + 1, RITUAL_TOTAL);
export const isComplete = (c: RitualCounter) => c.completed >= RITUAL_TOTAL;

/**
 * Sa'i direction for a given length. Length 1 is Safa → Marwah, length 2 is
 * Marwah → Safa, … length 7 ends at Marwah. Seven lengths, not seven round trips.
 */
export function saiDirection(length: number): "safa-marwah" | "marwah-safa" {
  return length % 2 === 1 ? "safa-marwah" : "marwah-safa";
}
