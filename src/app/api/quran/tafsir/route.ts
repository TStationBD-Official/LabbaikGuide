import { handleGet } from "@/server/route-helpers";
import { TafsirQuery } from "@/server/quran/query-schemas";
import { getTafsir } from "@/server/quran/service";

export async function GET(req: Request) {
  return handleGet(req, TafsirQuery, (q) => getTafsir(q.id, q.key), {
    sMaxAge: 60 * 60 * 24 * 7,
    swr: 60 * 60 * 24 * 30,
  });
}
