import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { ARABIC_FONTS, type ArabicFont } from "@/lib/preferences";
import { qcfGlyphs } from "@/server/quran/service";
import { verseText } from "@/components/quran/ayah-card";
import { RIWAYAH_FONT, RIWAYAT } from "@/config/riwayat";
import type { QuranVerse } from "@/types/quran";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("Quran script catalogue", () => {
  it("pairs every QCF font with its own glyph codes (Tajweed V4 draws the V2 codes)", () => {
    for (const k of Object.keys(ARABIC_FONTS) as ArabicFont[]) {
      const d = ARABIC_FONTS[k] as { script: string; qcf?: string };
      if (d.qcf === "v1") expect(d.script).toBe("code_v1");
      else if (d.qcf) expect(d.script).toBe("code_v2");
      else expect(["text_uthmani", "text_indopak", "text_qpc_hafs"]).toContain(d.script);
    }
  });

  it("has a @font-face and a data-ar-font rule for every Unicode font", () => {
    for (const k of Object.keys(ARABIC_FONTS) as ArabicFont[]) {
      const family = ARABIC_FONTS[k].family.replace(/'/g, "");
      expect(css).toContain(`font-family: "${family}"`);
      expect(css).toMatch(new RegExp(`\\[data-ar-font="${k}"\\]`));
    }
  });
});

describe("QCF glyphs", () => {
  it("keeps one glyph per word with its page", () => {
    const r = qcfGlyphs(
      [
        { code_v1: "ﮣ", v1_page: 42 },
        { code_v1: "ﮤ", v1_page: 43 },
      ],
      "v1",
    );
    expect(r).toEqual({ v: "v1", glyphs: [{ p: 42, c: "ﮣ" }, { p: 43, c: "ﮤ" }] });
  });
  it("refuses partial data instead of guessing a page", () => {
    expect(qcfGlyphs([{ code_v2: "ﲓ", v2_page: 42 }, { code_v2: "ﲔ", v2_page: null }], "v2")).toBeNull();
    expect(qcfGlyphs([{ code_v1: "ﮣ", v1_page: 605 }], "v1")).toBeNull();
  });
});

describe("verseText", () => {
  const v = { textUthmani: "U", textIndopak: "I", textQpcHafs: "Q" } as QuranVerse;
  it("returns the text of the chosen script", () => {
    expect(verseText(v, "text_uthmani")).toBe("U");
    expect(verseText(v, "text_indopak")).toBe("I");
    expect(verseText(v, "text_qpc_hafs")).toBe("Q");
    expect(verseText(v, "code_v2")).toBe("Q"); // copy/share uses KFGQPC Unicode
  });
});

describe("Other readings data", () => {
  const dir = join(process.cwd(), "public/data/riwayat");
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  const expected = { warsh: 6214, qaloon: 6214, shouba: 6236, doori: 6217, soosi: 6217, bazzi: 6220, qumbul: 6220 };

  it("has every reading with its own verse count, 114 surahs and a font", () => {
    for (const r of RIWAYAT) {
      const m = index.riwayat[r];
      expect(m.total).toBe(expected[r]);
      expect(m.counts).toHaveLength(114);
      expect(m.counts.reduce((a: number, b: number) => a + b, 0)).toBe(expected[r]);
      expect(m.basmala).toMatch(/^بِس/);
      expect(existsSync(join(process.cwd(), "public/fonts/quran/riwayat", RIWAYAH_FONT[r].file))).toBe(true);
      expect(css).toContain(`font-family: "${RIWAYAH_FONT[r].family}"`);
    }
  });

  it("numbers each surah's verses 1..n", () => {
    for (const r of RIWAYAT) {
      for (const s of [1, 2, 9, 114]) {
        const d = JSON.parse(readFileSync(join(dir, r, `${s}.json`), "utf8"));
        expect(d.ayahs.map((a: [number]) => a[0])).toEqual(Array.from({ length: index.riwayat[r].counts[s - 1] }, (_, i) => i + 1));
      }
    }
  });
});

describe("auto-scroll speed", async () => {
  const { useQuranStore, AUTO_SCROLL_SPEEDS } = await import("@/stores/quran-store");
  it("defaults to the previous speed and clamps to 1–10", () => {
    expect(AUTO_SCROLL_SPEEDS[useQuranStore.getState().scrollSpeed - 1]).toBe(28);
    useQuranStore.getState().setScrollSpeed(99);
    expect(useQuranStore.getState().scrollSpeed).toBe(10);
    useQuranStore.getState().setScrollSpeed(0);
    expect(useQuranStore.getState().scrollSpeed).toBe(1);
  });
});

describe("Bengali pronunciation data", () => {
  it("covers all 6236 Hafs verses; only damaged source verses are null", () => {
    let total = 0;
    const missing: string[] = [];
    for (let s = 1; s <= 114; s++) {
      const list: (string | null)[] = JSON.parse(readFileSync(join(process.cwd(), `public/data/bn-uccharon/${s}.json`), "utf8"));
      list.forEach((t, i) => {
        total++;
        if (t === null) missing.push(`${s}:${i + 1}`);
        else expect(t).toMatch(/^[ঀ-৿ ।,.\-‘’'!?;:‌‍]+$/);
      });
    }
    expect(total).toBe(6236);
    expect(missing).toEqual(["20:47"]);
  });
});
