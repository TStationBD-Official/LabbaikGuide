import { NextResponse } from "next/server";
import { getAbout } from "@/server/about/service";

/** Company profile + published apps from the panel. 502 with no data when it is unreachable — never made up. */
export async function GET() {
  try {
    const data = await getAbout();
    return NextResponse.json(data, {
      // Browser and CDN: 1 min, then served stale for up to a day while it refreshes in the background.
      // (The upstream data itself is cached for 5 min, or until /api/about/revalidate is called.)
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
