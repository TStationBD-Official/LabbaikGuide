import { handleGet } from "@/server/route-helpers";
import { ChaptersQuery } from "@/server/quran/query-schemas";
import { getChapters } from "@/server/quran/service";

export async function GET(req: Request) {
  return handleGet(req, ChaptersQuery, async (q) => ({ chapters: await getChapters(q.lang) }), {
    sMaxAge: 60 * 60 * 24 * 7,
    swr: 60 * 60 * 24 * 30,
  });
}
