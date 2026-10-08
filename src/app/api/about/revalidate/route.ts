import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { SERVER_CONFIG } from "@/config/server";
import { ABOUT_TAG } from "@/server/about/service";

/**
 * Optional instant refresh: the panel (or you) can POST here after editing,
 * with header `Authorization: Bearer <ABOUT_REVALIDATE_SECRET>`.
 * Without it, changes still appear within 5 minutes.
 */
export async function POST(request: NextRequest) {
  const secret = SERVER_CONFIG.about.revalidateSecret;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = secret.length >= 16 && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  revalidateTag(ABOUT_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: ABOUT_TAG });
}
