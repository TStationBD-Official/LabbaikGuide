import { describe, expect, it } from "vitest";
import { estimateTrip, PLACES, ROAD_FACTOR, TAXI } from "@/data/guides/ziyarah";

const BOX = {
  makkah: { lat: [21.2, 21.6], lon: [39.6, 40.1] },
  madinah: { lat: [24.3, 24.6], lon: [39.4, 39.8] },
  other: { lat: [20, 27], lon: [38, 41] },
} as const;

describe("ziyarah data", () => {
  it("has unique ids and places in every region", () => {
    const ids = PLACES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of ["makkah", "madinah", "other"] as const) expect(PLACES.some((p) => p.region === r)).toBe(true);
  });

  it.each(PLACES.map((p) => [p.id, p] as const))("%s is sourced, located and credited", (_id, p) => {
    const b = BOX[p.region];
    expect(p.lat).toBeGreaterThan(b.lat[0]);
    expect(p.lat).toBeLessThan(b.lat[1]);
    expect(p.lon).toBeGreaterThan(b.lon[0]);
    expect(p.lon).toBeLessThan(b.lon[1]);
    expect(p.name.en && p.name.bn && p.name.ur).toBeTruthy();
    expect(p.about.en.length).toBeGreaterThan(80);
    expect(p.more.length).toBeGreaterThan(0);
    for (const m of p.more) expect(m.url).toMatch(/^https:\/\//);
    for (const r of p.refs) if (r.url) expect(r.url).toMatch(/^https:\/\//);
    if (p.image) {
      expect(p.image.src).toMatch(/^https:\/\/upload\.wikimedia\.org\//);
      expect(p.image.page).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(p.image.author).toBeTruthy();
      expect(p.image.license).toMatch(/CC|Public domain|GFDL/i);
    }
  });
});

describe("estimateTrip", () => {
  it("only offers walking for short trips", () => {
    expect(estimateTrip(1).walkMin).toBeGreaterThan(10);
    expect(estimateTrip(5).walkMin).toBeNull();
  });

  it("uses the road factor and keeps taxi ranges ordered, at least the minimum fare", () => {
    for (const km of [0.5, 3, 8, 25, 70, 150]) {
      const e = estimateTrip(km);
      expect(e.roadKm).toBeCloseTo(km * ROAD_FACTOR);
      expect(e.taxi[0]).toBeGreaterThanOrEqual(TAXI.min);
      expect(e.taxi[1]).toBeGreaterThan(e.taxi[0]);
      expect(e.driveMin).toBeGreaterThanOrEqual(5);
    }
    // Makkah → Taif (~70 km straight): about an hour or more by road.
    expect(estimateTrip(70).driveMin).toBeGreaterThan(55);
  });
});
