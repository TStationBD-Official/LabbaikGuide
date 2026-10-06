import { NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic — remove after the Haramain schedule adapter is built.
 * Fetches fixed public URLs only (no user input → no SSRF).
 */
const ORIGIN = "https://haramainimams.com";
const UA = "Mozilla/5.0 (LabbaikGuide diagnostic)";

async function get(url: string) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json, */*" }, signal: AbortSignal.timeout(10000), cache: "no-store" });
  return { status: res.status, type: res.headers.get("content-type") ?? "", text: await res.text() };
}

function around(text: string, needle: string, radius = 500, max = 4) {
  const out: string[] = [];
  let i = text.indexOf(needle);
  while (i !== -1 && out.length < max) {
    out.push(text.slice(Math.max(0, i - radius), i + radius));
    i = text.indexOf(needle, i + needle.length);
  }
  return out;
}

export async function GET() {
  const report: Record<string, unknown> = {};
  try {
    const home = await get(ORIGIN + "/");
    const src = [...home.text.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => new URL(m[1], ORIGIN).toString())[0];
    const js = (await get(src)).text;
    report.bundleSize = js.length;
    report.employeesContext = around(js, "/api/employees", 700, 3);
    report.fetchCalls = around(js, "fetch(", 250, 8);
    report.absoluteUrls = [...new Set([...js.matchAll(/https?:\/\/[a-zA-Z0-9.-]+\.[a-z]{2,}[\w./-]*/g)].map((m) => m[0]))]
      .filter((u) => !/w3\.org|reactjs\.org|react\.dev|mozilla\.org|github\.com|fb\.me|schema\.org/i.test(u))
      .slice(0, 60);
    report.envHints = [...new Set([...js.matchAll(/VITE_[A-Z0-9_]+/g)].map((m) => m[0]))];

    const tries: Record<string, string> = {};
    for (const p of ["/api/employees", "/api/employees?mosque=haram", "/api/employees?location=makkah"]) {
      try {
        const r = await get(ORIGIN + p);
        tries[p] = `${r.status} ${r.type.split(";")[0]} ${r.text.slice(0, 1500)}`;
      } catch (e) {
        tries[p] = `error ${(e as Error).message}`;
      }
    }
    report.tries = tries;
  } catch (e) {
    report.error = (e as Error).message;
  }
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
