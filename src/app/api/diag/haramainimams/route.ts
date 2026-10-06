import { NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic — remove after the Haramain schedule adapter is built.
 * Fetches a fixed, public URL (no user input → no SSRF) and reports which data
 * endpoints its JavaScript bundles reference, so we can integrate the feed.
 */
const ORIGIN = "https://haramainimams.com";
const UA = "Mozilla/5.0 (LabbaikGuide diagnostic)";

async function get(url: string) {
  const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10000), cache: "no-store" });
  return { status: res.status, type: res.headers.get("content-type") ?? "", text: await res.text() };
}

export async function GET() {
  const report: Record<string, unknown> = {};
  try {
    const home = await get(ORIGIN + "/");
    report.homeStatus = home.status;
    const scripts = [...home.text.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => new URL(m[1], ORIGIN).toString());
    report.scripts = scripts;
    const inline = [...home.text.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].slice(0, 400));
    report.inlineScriptsPreview = inline.slice(0, 5);

    const found = new Set<string>();
    const patterns = [
      /https?:\/\/[a-zA-Z0-9.-]+(?:\/[\w./?=&%-]*)?/g,
      /["'`](\/(?:api|data|json|v1|v2|schedule|schedules|imams?)[\w./?=&%-]*)["'`]/g,
    ];
    const interesting = /api|json|schedule|imam|supabase|firebase|firestore|sheet|airtable|graphql|\.json/i;
    for (const src of scripts.slice(0, 15)) {
      try {
        const js = await get(src);
        for (const p of patterns) for (const m of js.text.matchAll(p)) {
          const u = m[1] ?? m[0];
          if (interesting.test(u) && !/w3\.org|reactjs|github\.com\/facebook|googleapis\.com\/css/i.test(u)) found.add(u);
        }
      } catch {
        /* skip */
      }
    }
    report.candidateEndpoints = [...found].slice(0, 80);

    // Probe a few common paths.
    const probes: Record<string, string> = {};
    for (const p of ["/api/schedule", "/api/schedules", "/api/imams", "/api/today", "/data.json", "/schedule.json"]) {
      try {
        const r = await get(ORIGIN + p);
        probes[p] = `${r.status} ${r.type.split(";")[0]} ${r.text.slice(0, 160).replace(/\s+/g, " ")}`;
      } catch (e) {
        probes[p] = `error ${(e as Error).message}`;
      }
    }
    report.probes = probes;
  } catch (e) {
    report.error = (e as Error).message;
  }
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
