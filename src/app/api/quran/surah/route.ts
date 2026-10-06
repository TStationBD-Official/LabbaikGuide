import { handleGet } from "@/server/route-helpers";
import { SurahFullQuery } from "@/server/quran/query-schemas";
import { getSurahFull } from "@/server/quran/service";

/** Whole surah in one response — used by "Download Quran for offline". */
export async function GET(req: Request) {
  return handleGet(
    req,
    SurahFullQuery,
    async (q) => ({ chapter: q.id, verses: await getSurahFull(q.id, q.lang, q.translation) }),
    { sMaxAge: 60 * 60 * 24 * 7, swr: 60 * 60 * 24 * 30 },
  );
}
