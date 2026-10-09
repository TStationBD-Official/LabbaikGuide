import { describe, expect, it } from "vitest";
import { distinctPaths } from "@/server/routing/service";

const line = (pts: [number, number][], distance: number) => ({ distance, coordinates: pts });
const straight = (lat0: number, lon: number, n: number): [number, number][] => Array.from({ length: n }, (_, i) => [lon, lat0 + i * 0.0003]);

describe("alternative walking paths", () => {
  const best = line(straight(21.42, 39.826, 20), 600);
  it("keeps a path along different streets", () => {
    const other = line(straight(21.42, 39.8285, 20), 700); // ~250 m to the east
    expect(distinctPaths(best, [other])).toHaveLength(1);
  });
  it("drops a path that is almost the same streets", () => {
    const same = line(straight(21.42, 39.82601, 20), 610);
    expect(distinctPaths(best, [same])).toHaveLength(0);
  });
  it("drops a detour that is far longer", () => {
    const detour = line(straight(21.42, 39.835, 20), 1600);
    expect(distinctPaths(best, [detour])).toHaveLength(0);
  });
});

describe("car routes", () => {
  it("asks the car router and returns the road route", async () => {
    const { vi } = await import("vitest");
    const { osrmRoute } = await import("@/server/routing/service");
    const calls: string[] = [];
    const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async (u) => {
      calls.push(String(u));
      return new Response(
        JSON.stringify({ code: "Ok", routes: [{ distance: 91000, duration: 4200, geometry: { type: "LineString", coordinates: [[39.82, 21.42], [40.41, 21.27]] } }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    });
    try {
      const r = await osrmRoute({ lat: 21.4225, lon: 39.8262 }, { lat: 21.2704, lon: 40.4085 }, "drive");
      expect(calls[0]).toContain("/routed-car/route/v1/driving/");
      expect(r.distance).toBe(91000);
      expect(r.coordinates).toHaveLength(2);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("thin", () => {
  it("keeps ends and the limit", async () => {
    const { thin } = await import("@/server/routing/service");
    const pts = Array.from({ length: 10001 }, (_, i) => i);
    const out = thin(pts, 4000);
    expect(out).toHaveLength(4000);
    expect(out[0]).toBe(0);
    expect(out.at(-1)).toBe(10000);
    expect(thin([1, 2, 3], 4000)).toEqual([1, 2, 3]);
  });
});
