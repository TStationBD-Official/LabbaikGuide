import { handleGet } from "@/server/route-helpers";
import { VersesQuery } from "@/server/quran/query-schemas";
import { getVerses } from "@/server/quran/service";

export async function GET(req: Request) {
  return handleGet(
    req,
    VersesQuery,
    (q) =>
      getVerses({
        mode: q.mode,
        id: q.id,
        page: q.page,
        lang: q.lang,
        translationId: q.translation,
        words: q.words,
        audio: q.audio,
      }),
    { sMaxAge: 60 * 60 * 24 * 7, swr: 60 * 60 * 24 * 30 },
  );
}
