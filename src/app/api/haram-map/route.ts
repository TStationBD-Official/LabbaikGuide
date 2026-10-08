import { NextResponse } from "next/server";
import { isLocationId } from "@/config/locations";
import { getHaramMap } from "@/server/haram-map/service";

export const maxDuration = 60;

/** Gates, facilities and landmarks around the two Holy Mosques, from OpenStreetMap. Never filled in by guesswork. */
export async function GET(req: Request) {
  const loc = new URL(req.url).searchParams.get("loc");
  if (!isLocationId(loc)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  try {
    const data = await getHaramMap(loc);
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
