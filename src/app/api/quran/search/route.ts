import { handleGet } from "@/server/route-helpers";
import { SearchQuery } from "@/server/quran/query-schemas";
import { searchQuran } from "@/server/quran/service";

export async function GET(req: Request) {
  return handleGet(req, SearchQuery, (q) => searchQuran(q.q, q.lang, q.translation), {
    sMaxAge: 60 * 60,
    swr: 60 * 60 * 24,
  });
}
