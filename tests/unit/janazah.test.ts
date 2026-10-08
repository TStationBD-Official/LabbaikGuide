import { describe, expect, it } from "vitest";
import { duasFor, poseAt, RULINGS, STEPS, FATIHA, THANA, DUROOD, SALAM } from "@/data/guides/janazah";

const step = (n: number) => STEPS.find((s) => s.takbir === n)!;

describe("janazah tutorial", () => {
  it("has the intention and exactly four takbirs, in order", () => {
    expect(STEPS.map((s) => s.takbir)).toEqual([0, 1, 2, 3, 4]);
  });

  it("raises the hands at every takbir in the Haramain, only the first for Hanafis", () => {
    expect(poseAt(step(1), 1000, "haramain").pose).toBe("raise");
    expect(poseAt(step(2), 1000, "haramain").pose).toBe("raise");
    expect(poseAt(step(1), 1000, "hanafi").pose).toBe("raise");
    expect(poseAt(step(2), 1000, "hanafi").pose).toBe("fold");
    expect(poseAt(step(2), 1000, "hanafi").saying).toBe("takbir");
  });

  it("never shows ruku/sujud: every pose is a standing pose", () => {
    const poses = new Set<string>();
    for (const s of STEPS) for (let t = 0; t < s.ms; t += 100) for (const m of ["haramain", "hanafi"] as const) poses.add(poseAt(s, t, m).pose);
    expect([...poses].every((p) => ["stand", "raise", "fold", "salamR", "salamL"].includes(p))).toBe(true);
  });

  it("gives one salam in the Haramain and two (right, then left) for Hanafis", () => {
    const seq = (m: "haramain" | "hanafi") => {
      const out: string[] = [];
      for (let t = 0; t < step(4).ms; t += 100) {
        const p = poseAt(step(4), t, m).pose;
        if (p.startsWith("salam") && out.at(-1) !== p) out.push(p);
      }
      return out;
    };
    expect(seq("haramain")).toEqual(["salamR"]);
    expect(seq("hanafi")).toEqual(["salamR", "salamL"]);
  });

  it("shows the child dua for a child and a pronoun note for a woman", () => {
    expect(duasFor("child").texts.map((x) => x.id)).toContain("dua-child");
    expect(duasFor("woman").note).toBeDefined();
    expect(duasFor("man").note).toBeUndefined();
  });

  it("cites a source for every text and every hadith-based ruling", () => {
    for (const x of [FATIHA, THANA, DUROOD, SALAM, ...duasFor("man").texts, ...duasFor("child").texts]) expect(x.refs.length).toBeGreaterThan(0);
    for (const r of RULINGS.filter((r) => !["hands", "late"].includes(r.id))) expect(r.refs.length).toBeGreaterThan(0);
  });
});
