import { describe, expect, it } from "vitest";
import { useWalksStore } from "@/stores/walks-store";
import { addFix, startTrack, EMPTY_TRACK } from "@/features/places/track";

const fix = (lat: number, time: number) => ({ lat, lon: 39.826, time, accuracy: 8 });

describe("saved walks", () => {
  it("saves the recording with a name, then edits and deletes it", () => {
    const s = useWalksStore.getState();
    s.setCurrent(() => EMPTY_TRACK);
    expect(s.saveCurrent("x", "makkah", 0)).toBeNull(); // nothing recorded yet
    s.setCurrent((c) => startTrack(c, 1000));
    s.setCurrent((c) => addFix(c, fix(21.42, 2000)));
    s.setCurrent((c) => addFix(c, fix(21.4205, 30_000)));
    s.setCurrent((c) => addFix(c, fix(21.421, 61_000)));
    const id = s.saveCurrent("  Hotel → Gate 79  ", "makkah", 61_000)!;
    const w = useWalksStore.getState().walks.find((x) => x.id === id)!;
    expect(w).toMatchObject({ name: "Hotel → Gate 79", loc: "makkah", activeMs: 60_000, createdAt: 2000 });
    expect(w.points).toHaveLength(3);
    expect(w.walked).toBeGreaterThan(100);
    expect(useWalksStore.getState().current.points).toHaveLength(0); // recording cleared
    s.update(id, { name: "Back route", note: "Use the escalator" });
    expect(useWalksStore.getState().walks[0]).toMatchObject({ name: "Back route", note: "Use the escalator" });
    s.remove(id);
    expect(useWalksStore.getState().walks.some((x) => x.id === id)).toBe(false);
  });
});
