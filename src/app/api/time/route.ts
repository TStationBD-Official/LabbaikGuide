import { NextResponse } from "next/server";

/** Server clock reference, used to detect wrong device clocks for prayer countdowns. */
export function GET() {
  return NextResponse.json({ now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
