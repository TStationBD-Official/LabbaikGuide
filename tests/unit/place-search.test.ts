import { describe, expect, it } from "vitest";
import { kindOf, parsePhoton } from "@/server/places/search";
import sample from "../fixtures/photon-makkah-2026-10-09.json";

describe("place search (Photon results)", () => {
  it("reads hotels with their street and area", () => {
    const hits = parsePhoton(sample.bbox);
    expect(hits[0]).toMatchObject({ name: "Hilton Suites Jabal Omar Makkah", kind: "hotel", lat: 21.421065, lon: 39.821438 });
    expect(hits[0].detail).toContain("Jabal Omar Street");
    expect(hits.every((h) => h.lat > 21.25 && h.lat < 21.6)).toBe(true);
  });

  it("keeps one result per street name and area", () => {
    const hits = parsePhoton(sample.street);
    expect(hits.filter((h) => h.name === "Ibrahim Al Khalil Road").length).toBeLessThan(3);
    expect(hits[0].kind).toBe("street");
  });

  it("handles Arabic names", () => {
    expect(parsePhoton(sample.arabic)[0].name).toBe("فندق صفوة الميعاد");
  });

  it("classifies common places", () => {
    expect(kindOf("tourism", "hotel")).toBe("hotel");
    expect(kindOf("amenity", "place_of_worship")).toBe("mosque");
    expect(kindOf("amenity", "pharmacy")).toBe("health");
    expect(kindOf("railway", "station")).toBe("transport");
  });
});
