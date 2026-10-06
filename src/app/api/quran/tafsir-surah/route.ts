import { handleGet } from "@/server/route-helpers";
import { TafsirChapterQuery } from "@/server/quran/query-schemas";
import { getTafsirChapter } from "@/server/quran/service";

/** Whole-surah tafsir — used by the optional tafsir offline download. */
export async function GET(req: Request) {
  return handleGet(req, TafsirChapterQuery, (q) => getTafsirChapter(q.id, q.chapter), {
    sMaxAge: 60 * 60 * 24 * 7,
    swr: 60 * 60 * 24 * 30,
  });
}
