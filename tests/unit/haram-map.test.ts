import { describe, expect, it } from "vitest";
import { buildQuery, classify, numberIn, parseOverpass } from "@/server/haram-map/service";

const node = (id: number, tags: Record<string, string>, lat = 21.4225, lon = 39.8262) => ({ type: "node", id, lat, lon, tags });

describe("haram map: OpenStreetMap parsing", () => {
  it("reads gate numbers from ref or names, including Arabic digits", () => {
    expect(numberIn("Gate 79")).toBe(79);
    expect(numberIn("باب ٧٩")).toBe(79);
    expect(numberIn("King Fahd")).toBeUndefined();
  });

  it("classifies gates, facilities and landmarks; ignores hotel doors", () => {
    expect(classify(node(1, { entrance: "main", name: "باب الملك فهد", "name:en": "King Fahd Gate", ref: "79" }), false)).toMatchObject({ kind: "gate", num: 79, role: "main" });
    expect(classify(node(2, { entrance: "emergency" }), true)).toMatchObject({ kind: "gate", restricted: true, onMosque: true });
    expect(classify(node(3, { entrance: "yes", name: "Hilton lobby" }), false)).toBeNull();
    expect(classify(node(4, { amenity: "toilets", female: "yes" }), false)).toMatchObject({ kind: "toilets", gender: "female" });
    expect(classify(node(5, { amenity: "drinking_water", name: "Zamzam" }), false)).toMatchObject({ kind: "zamzam" });
    expect(classify(node(6, { name: "الكعبة المشرفة", "name:en": "Kaaba" }), false)).toMatchObject({ kind: "landmark", landmark: "kaaba" });
    expect(classify(node(7, { name: "Al-Baqi Cemetery", landuse: "cemetery" }), false)).toMatchObject({ landmark: "baqi" });
  });

  it("marks doors on the mosque outline and removes duplicates", () => {
    const json = {
      elements: [
        { type: "node", id: 10 },
        { type: "count", id: 0, tags: { total: "0" } },
        node(10, { entrance: "yes", ref: "1" }),
        node(11, { name: "Gate 1", entrance: "yes", ref: "1" }, 21.42251, 39.82621),
        node(12, { amenity: "toilets" }),
      ],
    };
    const pois = parseOverpass(json, "makkah");
    expect(pois.filter((p) => p.kind === "gate")).toHaveLength(1);
    expect(pois.find((p) => p.kind === "gate")).toMatchObject({ onMosque: true, num: 1 });
    expect(pois.some((p) => p.kind === "toilets")).toBe(true);
  });

  it("queries around the right mosque", () => {
    expect(buildQuery("makkah")).toContain("21.422487,39.826206");
    expect(buildQuery("madinah")).toContain("24.467206,39.611133");
  });
});

describe("hand-checked gates", () => {
  it("replace the OpenStreetMap gate with the same number and keep the rest", async () => {
    const { mergeVerified } = await import("@/server/haram-map/service");
    const osm = [
      { id: "n1", kind: "gate" as const, lat: 21.4, lon: 39.8, num: 84 },
      { id: "n2", kind: "gate" as const, lat: 21.41, lon: 39.81, num: 85 },
      { id: "n3", kind: "toilets" as const, lat: 21.42, lon: 39.82 },
    ];
    const out = mergeVerified(osm, [{ num: 84, lat: 21.5, lon: 39.9, source: "test", checked: "2026-10-09" }]);
    const g84 = out.filter((p) => p.num === 84);
    expect(g84).toHaveLength(1);
    expect(g84[0]).toMatchObject({ lat: 21.5, lon: 39.9, verified: true });
    expect(out.some((p) => p.id === "n2")).toBe(true);
    expect(out.some((p) => p.id === "n3")).toBe(true);
  });
});

describe("Masjid al-Haram gates from a real OpenStreetMap snapshot", async () => {
  const snap = (await import("../fixtures/haram-osm-2026-10-09.json")).default;
  const gates = parseOverpass(snap, "makkah").filter((p) => p.kind === "gate");
  const nums = gates.map((g) => g.num).filter((n): n is number => n !== undefined);

  it("keeps neighbouring unnamed gates (83, 84, 85 are metres apart)", () => {
    for (const n of [80, 81, 82, 83, 84, 85, 86, 87, 88]) expect(nums).toContain(n);
    expect(gates.find((g) => g.num === 84)).toMatchObject({ lat: 21.4209167, lon: 39.8244405 });
  });

  it("includes numbered doors that are not on the drawn outline", () => {
    for (const n of [75, 91, 92, 117, 118, 124, 125, 156, 157]) expect(nums).toContain(n);
  });

  it("uses the official numbers of the five main gates", () => {
    expect(gates.find((g) => g.nameEn?.includes("Fateh"))?.num).toBe(45);
    expect(gates.find((g) => g.nameEn?.includes("Umra"))?.num).toBe(62);
    expect(gates.find((g) => g.num === 1)?.nameEn).toContain("King Abdul Aziz");
    expect(gates.find((g) => g.num === 79)?.nameEn).toContain("King Fahd");
    expect(gates.find((g) => g.num === 100)?.nameEn).toContain("King Abdullah");
  });

  it("never lists a gate number twice and leaves out hotel doors", () => {
    expect(new Set(nums).size).toBe(nums.length);
    expect(gates.some((g) => /jabel|jabal|hilton|hyatt|conrad|tower|food|kebab/i.test(`${g.name} ${g.nameEn}`))).toBe(false);
  });
});
