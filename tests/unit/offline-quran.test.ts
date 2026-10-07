import "fake-indexeddb/auto";
import { beforeAll, describe, expect, it } from "vitest";
import { createStore, set } from "idb-keyval";
import { offlineResources, offlineSearch, offlineTafsir, offlineVerses, type OfflineMeta } from "@/services/quran/offline";
import type { QuranVerse } from "@/types/quran";

const verse = (c: number, n: number, juz: number, tr: string): QuranVerse => ({
  key: `${c}:${n}`,
  number: n,
  chapterId: c,
  juz,
  hizb: 1,
  page: c,
  textUthmani: `ٱلْحَمْدُ ${n}`,
  textIndopak: `اَلۡحَمۡدُ ${n}`,
  textQpcHafs: null,
  qcf: null,
  translationHtml: tr,
  words: null,
  audioUrl: null,
});

beforeAll(async () => {
  const s = createStore("hc-quran-offline", "kv");
  const meta: OfflineMeta = {
    lang: "bn",
    translationId: 161,
    translationName: "Bangla",
    tafsirId: 164,
    tafsirName: "Tafsir",
    surahs: [1, 2],
    tafsirSurahs: [2],
    updatedAt: 1,
  };
  await set("meta", meta, s);
  await set("v:1", Array.from({ length: 7 }, (_, i) => verse(1, i + 1, 1, `প্রশংসা ${i + 1}`)), s);
  await set("v:2", Array.from({ length: 25 }, (_, i) => verse(2, i + 1, i < 20 ? 1 : 2, `অনুবাদ ${i + 1}`)), s);
  await set("t:2", { "2:1": "<p>group 1-4</p>", "2:5": "<p>ayah 5</p>" }, s);
});

describe("offline Quran", () => {
  it("serves a surah in reader-sized pages with pagination", async () => {
    const p1 = await offlineVerses({ mode: "surah", id: 2, page: 1, lang: "bn", translationId: 161 });
    expect(p1?.verses).toHaveLength(10);
    expect(p1?.pagination).toEqual({ current: 1, next: 2, totalPages: 3, totalRecords: 25 });
    const p3 = await offlineVerses({ mode: "surah", id: 2, page: 3, lang: "bn", translationId: 161 });
    expect(p3?.verses.map((v) => v.number)).toEqual([21, 22, 23, 24, 25]);
    expect(p3?.pagination.next).toBeNull();
  });

  it("never shows the downloaded translation under a different language or translation", async () => {
    const other = await offlineVerses({ mode: "surah", id: 1, page: 1, lang: "en", translationId: 20 });
    expect(other?.verses[0].translationHtml).toBeNull();
    expect(other?.verses[0].textIndopak).toBeTruthy(); // Arabic is still available
    const same = await offlineVerses({ mode: "surah", id: 1, page: 1, lang: "bn", translationId: 161 });
    expect(same?.verses[0].translationHtml).toBe("প্রশংসা 1");
  });

  it("assembles juz from all downloaded surahs and returns null for missing surahs", async () => {
    const juz2 = await offlineVerses({ mode: "juz", id: 2, page: 1, lang: "bn", translationId: 161 });
    expect(juz2?.verses.map((v) => v.key)).toEqual(["2:21", "2:22", "2:23", "2:24", "2:25"]);
    expect(await offlineVerses({ mode: "surah", id: 3, page: 1, lang: "bn", translationId: 161 })).toBeNull();
  });

  it("finds tafsir for an ayah inside a commented group", async () => {
    expect((await offlineTafsir(164, "2:3"))?.html).toBe("<p>group 1-4</p>");
    expect((await offlineTafsir(164, "2:5"))?.html).toBe("<p>ayah 5</p>");
    expect(await offlineTafsir(999, "2:1")).toBeNull(); // different tafsir → not served
    expect(await offlineTafsir(164, "1:1")).toBeNull(); // surah tafsir not downloaded
  });

  it("searches Arabic (ignoring diacritics) and the matching translation", async () => {
    const ar = await offlineSearch("الحمد 7", "bn", 161);
    expect(ar?.results.map((r) => r.verseKey)).toContain("1:7");
    const bn = await offlineSearch("অনুবাদ 25", "bn", 161);
    expect(bn?.results[0].verseKey).toBe("2:25");
    expect((await offlineSearch("অনুবাদ 25", "en", 20))?.totalResults).toBe(0);
  });

  it("offers the downloaded translation as a resource offline", async () => {
    expect((await offlineResources("translations", "bn"))?.resources[0].id).toBe(161);
    expect(await offlineResources("translations", "en")).toBeNull();
  });
});
