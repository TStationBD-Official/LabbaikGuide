import { describe, expect, it } from "vitest";
import { applyIncrement, applyReset, applyUndo, computeStats, CustomZikrInput, localDayKey, moveItem } from "@/features/zikr/logic";

describe("zikr logic", () => {
  it("increments count and daily history", () => {
    const r = applyIncrement({}, {}, [], "a", "2026-10-06");
    expect(r.counts.a).toBe(1);
    expect(r.history["2026-10-06"]).toBe(1);
    expect(r.undo).toHaveLength(1);
  });

  it("undo reverts the last increment for that zikr only", () => {
    let s = { counts: {}, history: {}, undo: [] } as ReturnType<typeof applyIncrement>;
    s = applyIncrement(s.counts, s.history, s.undo, "a", "d");
    s = applyIncrement(s.counts, s.history, s.undo, "b", "d");
    const u = applyUndo(s.counts, s.history, s.undo, "a");
    expect(u.undone).toBe(true);
    expect(u.counts).toEqual({ a: 0, b: 1 });
    expect(u.history.d).toBe(1);
  });

  it("undo restores a reset", () => {
    const inc = applyIncrement({ a: 9 }, {}, [], "a", "d");
    const reset = applyReset(inc.counts, inc.undo, "a");
    expect(reset.counts.a).toBe(0);
    const u = applyUndo(reset.counts, inc.history, reset.undo, "a");
    expect(u.counts.a).toBe(10);
  });

  it("undo with nothing to undo is a no-op", () => {
    expect(applyUndo({}, {}, []).undone).toBe(false);
  });

  it("reset of zero does not add an undo entry", () => {
    expect(applyReset({ a: 0 }, [], "a").undo).toHaveLength(0);
  });

  it("computes today / yesterday / week / month / total", () => {
    const now = new Date(2026, 9, 6, 12);
    const h = {
      [localDayKey(now)]: 10,
      [localDayKey(new Date(2026, 9, 5))]: 5,
      [localDayKey(new Date(2026, 9, 1))]: 3,
      [localDayKey(new Date(2026, 8, 20))]: 100,
    };
    expect(computeStats(h, now)).toEqual({ today: 10, yesterday: 5, week: 18, month: 18, total: 118 });
  });

  it("validates custom zikr input", () => {
    expect(CustomZikrInput.safeParse({ name: "", arabic: "", pronunciation: "", meaning: "", target: 10 }).success).toBe(false);
    expect(CustomZikrInput.safeParse({ name: "X", arabic: "", pronunciation: "", meaning: "", target: 0 }).success).toBe(false);
    expect(CustomZikrInput.safeParse({ name: "X", arabic: "", pronunciation: "", meaning: "", target: "33" }).data?.target).toBe(33);
    expect(CustomZikrInput.safeParse({ name: "x".repeat(81), arabic: "", pronunciation: "", meaning: "", target: 1 }).success).toBe(false);
  });

  it("reorders items safely", () => {
    expect(moveItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b"], 1, 2)).toEqual(["a", "b"]);
  });
});
