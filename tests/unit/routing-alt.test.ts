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
