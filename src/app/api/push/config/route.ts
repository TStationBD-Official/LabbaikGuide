import { NextResponse } from "next/server";
import { SERVER_CONFIG } from "@/config/server";
import { pushEnabled } from "@/server/push/service";

/** Public push configuration (the VAPID public key is public by design). */
export function GET() {
  const enabled = pushEnabled();
  return NextResponse.json(
    { enabled, publicKey: enabled ? SERVER_CONFIG.push.vapidPublicKey : null },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } },
  );
}
