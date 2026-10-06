import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/quran/upstream", async () => {
  const actual = await vi.importActual<typeof import("@/server/quran/upstream")>("@/server/quran/upstream");
  return { ...actual, quranFetch: vi.fn() };
});

import { quranFetch, UpstreamError } from "@/server/quran/upstream";
import { getResources, getVerses } from "@/server/quran/service";

const mocked = vi.mocked(quranFetch);

describe("quran service normalisation", () => {
  it("keeps IndoPak text from the API, sanitises translation and builds audio URL", async () => {
    mocked.mockResolvedValueOnce({
      verses: [
        {
          id: 1, verse_number: 1, verse_key: "1:1", juz_number: 1, hizb_number: 1, page_number: 1,
          text_uthmani: "بِسْمِ", text_indopak: "بِسۡمِ",
          translations: [{ resource_id: 161, text: "x<script>bad()</script><sup foot_note=9>1</sup>" }],
          audio: { url: "Alafasy/mp3/001001.mp3" },
        },
      ],
      pagination: { current_page: 1, next_page: null, total_pages: 1, total_records: 7 },
    });
    const r = await getVerses({ mode: "surah", id: 1, page: 1, lang: "bn", translationId: 161, words: false, audio: true });
    expect(r.verses[0].textIndopak).toBe("بِسۡمِ");
    expect(r.verses[0].translationHtml).toBe("x<sup>1</sup>");
    expect(r.verses[0].audioUrl).toBe("https://verses.quran.com/Alafasy/mp3/001001.mp3");
    expect(r.pagination).toEqual({ current: 1, next: null, totalPages: 1, totalRecords: 7 });
  });

  it("throws a 502 UpstreamError on unexpected shapes instead of rendering garbage", async () => {
    mocked.mockResolvedValueOnce({ verses: "nope" });
    await expect(getVerses({ mode: "surah", id: 1, page: 1, lang: "bn", words: false, audio: false })).rejects.toBeInstanceOf(UpstreamError);
  });

  it("filters resources to the requested language, or reports no match", async () => {
    mocked.mockResolvedValueOnce({ tafsirs: [{ id: 1, name: "A", language_name: "english" }, { id: 2, name: "B", language_name: "bengali" }] });
    expect(await getResources("tafsirs", "bn")).toEqual({ resources: [{ id: 2, name: "B", authorName: null, languageName: "bengali" }], matchedLanguage: true });
    mocked.mockResolvedValueOnce({ tafsirs: [{ id: 1, name: "A", language_name: "english" }] });
    expect((await getResources("tafsirs", "ur")).matchedLanguage).toBe(false);
  });
});
