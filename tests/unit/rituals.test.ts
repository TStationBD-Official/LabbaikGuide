import { describe, expect, it } from "vitest";
import { advance, back, currentNumber, emptyCounter, isComplete, resetCounter, saiDirection, setNote, undo } from "@/features/manasik/counter";

describe("tawaf / sa'i counter", () => {
  it("never exceeds 7 or goes below 0", () => {
    let c = emptyCounter();
    for (let i = 0; i < 10; i++) c = advance(c);
    expect(c.completed).toBe(7);
    expect(isComplete(c)).toBe(true);
    expect(currentNumber(c)).toBe(7);
    let d = emptyCounter();
    d = back(d);
    expect(d.completed).toBe(0);
  });

  it("undo reverts advance, back and reset", () => {
    let c = advance(advance(emptyCounter()));
    c = resetCounter(setNote(c, 2, "note"));
    expect(c.completed).toBe(0);
    c = undo(c);
    expect(c.completed).toBe(2);
    expect(c.notes[2]).toBe("note");
    c = undo(c);
    expect(c.completed).toBe(1);
  });

  it("sa'i is seven lengths: odd Safa→Marwah, even Marwah→Safa, ending at Marwah", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(saiDirection)).toEqual([
      "safa-marwah", "marwah-safa", "safa-marwah", "marwah-safa", "safa-marwah", "marwah-safa", "safa-marwah",
    ]);
  });

  it("notes are trimmed to 280 chars and empty notes removed", () => {
    let c = setNote(emptyCounter(), 1, "x".repeat(500));
    expect(c.notes[1]).toHaveLength(280);
    c = setNote(c, 1, "   ");
    expect(c.notes[1]).toBeUndefined();
  });
});
