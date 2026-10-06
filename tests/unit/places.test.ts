import { beforeEach, describe, expect, it } from "vitest";
import {
  arrivalRadius,
  averageFixes,
  bearingDeg,
  circleRing,
  destination,
  directionsLinks,
  distanceM,
  parseCoordinates,
  tilesForArea,
  tileXY,
  walkingMinutes,
} from "@/features/places/geo";
import { usePlacesStore } from "@/stores/places-store";

const KAABA = { lat: 21.422487, lon: 39.826206 };
const CLOCK_TOWER = { lat: 21.418924, lon: 39.825516 };

describe("geo helpers", () => {
  it("measures short distances in Makkah accurately", () => {
    const d = distanceM(KAABA, CLOCK_TOWER);
    expect(d).toBeGreaterThan(390);
    expect(d).toBeLessThan(410);
    expect(distanceM(KAABA, KAABA)).toBe(0);
  });

  it("computes bearings (Clock Tower is roughly south of the Ka'bah)", () => {
    const b = bearingDeg(KAABA, CLOCK_TOWER);
    expect(b).toBeGreaterThan(185);
    expect(b).toBeLessThan(195);
    expect(bearingDeg({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(90, 5);
  });

  it("destination and distance are inverse", () => {
    const p = destination(KAABA, 47, 1234);
    expect(distanceM(KAABA, p)).toBeCloseTo(1234, 0);
    expect(bearingDeg(KAABA, p)).toBeCloseTo(47, 1);
  });

  it("builds a closed accuracy ring of the right radius", () => {
    const ring = circleRing(KAABA, 30, 16);
    expect(ring).toHaveLength(17);
    expect(ring[0]).toEqual(ring[16]);
    expect(distanceM(KAABA, { lon: ring[5][0], lat: ring[5][1] })).toBeCloseTo(30, 0);
  });

  it("averages GPS fixes weighted by accuracy and drops poor outliers", () => {
    const t = Date.now();
    const avg = averageFixes([
      { ...KAABA, accuracy: 5, time: t },
      { ...destination(KAABA, 90, 4), accuracy: 5, time: t },
      { ...destination(KAABA, 0, 300), accuracy: 120, time: t }, // outlier: ignored
    ])!;
    expect(distanceM(avg, KAABA)).toBeLessThan(3);
    expect(avg.accuracy).toBeGreaterThanOrEqual(3.75);
    expect(averageFixes([])).toBeNull();
  });

  it("gives a sensible walking time and arrival radius", () => {
    expect(walkingMinutes(660)).toBe(10);
    expect(walkingMinutes(5)).toBe(1);
    expect(arrivalRadius(5)).toBe(25);
    expect(arrivalRadius(40)).toBe(40);
    expect(arrivalRadius(500)).toBe(60);
  });

  it("parses coordinates and common map links, rejecting junk", () => {
    expect(parseCoordinates("21.4225, 39.8262")).toEqual({ lat: 21.4225, lon: 39.8262 });
    expect(parseCoordinates("https://www.google.com/maps/@21.4189,39.8255,17z")).toEqual({ lat: 21.4189, lon: 39.8255 });
    expect(parseCoordinates("https://maps.google.com/?q=21.42,39.82")).toEqual({ lat: 21.42, lon: 39.82 });
    expect(parseCoordinates("https://www.openstreetmap.org/?mlat=21.4&mlon=39.8#map=17/21.4/39.8")).toEqual({ lat: 21.4, lon: 39.8 });
    expect(parseCoordinates("geo:21.4,39.8")).toEqual({ lat: 21.4, lon: 39.8 });
    expect(parseCoordinates("95, 39")).toBeNull();
    expect(parseCoordinates("hello")).toBeNull();
  });

  it("computes slippy tiles and a bounded tile set", () => {
    expect(tileXY({ lat: 0, lon: 0 }, 1)).toEqual({ x: 1, y: 1 });
    const tiles = tilesForArea([KAABA], 500, 12, 16);
    expect(tiles.length).toBeGreaterThan(5);
    expect(tiles.length).toBeLessThan(80);
    expect(tilesForArea([KAABA], 50_000, 10, 18, 100)).toHaveLength(100);
  });

  it("builds walking direction links without API keys", () => {
    const l = directionsLinks(KAABA, CLOCK_TOWER);
    expect(l.google).toContain("travelmode=walking");
    expect(l.google).toContain("destination=21.422487,39.826206");
    expect(l.apple).toContain("dirflg=w");
    expect(l.osm).toContain("openstreetmap.org/directions");
  });
});

describe("places store", () => {
  beforeEach(() => usePlacesStore.setState({ places: [], activeId: null }));

  it("adds, sanitises, activates, updates and removes places", () => {
    const { add, update, remove } = usePlacesStore.getState();
    const id = add({ kind: "hotel", name: "  Hilton   Suites ", lat: 21.42, lon: 39.82, accuracy: 6, source: "gps", room: " 1203 " });
    let s = usePlacesStore.getState();
    expect(s.activeId).toBe(id);
    expect(s.places[0]).toMatchObject({ name: "Hilton Suites", room: "1203", accuracy: 6 });
    update(id, { name: "Hotel", lat: 21.43, lon: 39.83 });
    s = usePlacesStore.getState();
    expect(s.places[0]).toMatchObject({ name: "Hotel", lat: 21.43 });
    update(id, { lat: 200, lon: 0 }); // invalid → ignored
    expect(usePlacesStore.getState().places[0].lat).toBe(21.43);
    const id2 = add({ kind: "meeting", name: "Gate 79", lat: 21.42, lon: 39.82, accuracy: null, source: "map" });
    remove(id2);
    expect(usePlacesStore.getState().activeId).toBe(id);
  });

  it("rejects invalid coordinates", () => {
    expect(() => usePlacesStore.getState().add({ kind: "hotel", name: "x", lat: NaN, lon: 1, accuracy: null, source: "map" })).toThrow();
  });
});
