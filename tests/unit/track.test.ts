import { describe, expect, it } from "vitest";
import { addFix, elapsedMs, EMPTY_TRACK, loadTrack, startTrack, stepsFor, stopTrack } from "@/features/places/track";

const fix = (lat: number, lon: number, time: number, accuracy = 8) => ({ lat, lon, time, accuracy });

describe("recorded walk", () => {
  it("records only while on, skipping jitter and poor fixes", () => {
    let t = addFix(EMPTY_TRACK, fix(21.42, 39.826, 0));
    expect(t.points).toHaveLength(0); // not recording yet
    t = startTrack(t, 0);
    t = addFix(t, fix(21.42, 39.826, 1000));
    t = addFix(t, fix(21.42001, 39.826, 2000)); // ~1 m: jitter
    t = addFix(t, fix(21.4201, 39.826, 3000, 80)); // poor accuracy
    t = addFix(t, fix(21.4201, 39.826, 4000)); // ~11 m
    expect(t.points).toHaveLength(2);
    expect(t.walked).toBeGreaterThan(10);
    expect(t.walked).toBeLessThan(12.5);
  });

  it("counts time without pauses and survives a save/load round trip", () => {
    let t = startTrack(EMPTY_TRACK, 0);
    t = stopTrack(t, 60_000);
    t = startTrack(t, 120_000);
    expect(elapsedMs(t, 150_000)).toBe(90_000);
    const back = loadTrack(JSON.stringify(t));
    expect(back).toEqual(t);
    expect(loadTrack("not json")).toEqual(EMPTY_TRACK);
    expect(loadTrack(JSON.stringify({ v: 2 }))).toEqual(EMPTY_TRACK);
  });

  it("estimates steps from distance", () => {
    expect(stepsFor(72)).toBe(100);
  });
});
