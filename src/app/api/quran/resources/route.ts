import { handleGet } from "@/server/route-helpers";
import { ResourcesQuery } from "@/server/quran/query-schemas";
import { getResources } from "@/server/quran/service";

export async function GET(req: Request) {
  return handleGet(req, ResourcesQuery, (q) => getResources(q.type, q.lang), {
    sMaxAge: 60 * 60 * 24,
    swr: 60 * 60 * 24 * 7,
  });
}
