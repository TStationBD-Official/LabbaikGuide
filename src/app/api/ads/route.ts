import { NextResponse, type NextRequest } from "next/server";
import { getAdLinks } from "@/server/ads/service";

export const maxDuration = 30;

/** Banner links that can be shown in a frame. Empty list when the feed is unavailable — never made up. */
export async function GET(request: NextRequest) {
  try {
    const links = await getAdLinks(request.nextUrl.origin);
    return NextResponse.json(
      { links },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ links: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
