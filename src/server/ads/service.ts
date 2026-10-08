import "server-only";
import { z } from "zod";
import { SERVER_CONFIG } from "@/config/server";

const FeedSchema = z.object({
  links: z.array(z.object({ id: z.union([z.string(), z.number()]).transform(String), type: z.string().optional(), value: z.string() })),
});

export type AdLink = { id: string; url: string };

/** Only public https pages: no local addresses, IP literals or internal hosts (the server fetches them). */
export function safeUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || h === "localhost" || /\.(local|internal|localhost)$/.test(h)) return null;
  if (/^\d+(\.\d+){3}$/.test(h) || h.includes(":") || h.startsWith("[")) return null;
  return u.toString();
}

/**
 * Whether a page lets other sites show it in a frame. Pages that send
 * X-Frame-Options or a CSP `frame-ancestors` that excludes us would only show
 * a browser error inside the banner, so they are left out.
 */
export function allowsFraming(headers: Headers, ourOrigin: string): boolean {
  const xfo = headers.get("x-frame-options")?.trim().toLowerCase();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin") || xfo.includes("allow-from"))) return false;
  const csp = headers.get("content-security-policy");
  if (!csp) return true;
  const ourHost = new URL(ourOrigin).host;
  // Several policies may be joined with commas; every one must allow us.
  return csp.split(",").every((policy) => {
    const dir = policy
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .find((parts) => parts[0]?.toLowerCase() === "frame-ancestors");
    if (!dir) return true;
    return dir.slice(1).some((src) => {
      const s = src.toLowerCase().replace(/\/$/, "");
      if (s === "*" || s === "https:") return true;
      const host = s.replace(/^https?:\/\//, "");
      if (host === ourHost) return true;
      return host.startsWith("*.") && ourHost.endsWith(host.slice(1));
    });
  });
}

const frameCache = new Map<string, { ok: boolean; at: number }>();
let feedCache: { links: AdLink[]; at: number } | null = null;

async function checkFrame(url: string, ourOrigin: string): Promise<boolean> {
  const hit = frameCache.get(url);
  if (hit && Date.now() - hit.at < SERVER_CONFIG.ads.frameCheckTtlMs) return hit.ok;
  let ok = false;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(SERVER_CONFIG.ads.timeoutMs),
      headers: { accept: "text/html,*/*", "user-agent": "Mozilla/5.0 (compatible; LabbaikGuide-banner-check)" },
      cache: "no-store",
    });
    // The redirect target must be safe too, since the frame will follow it.
    ok = res.ok && safeUrl(res.url || url) !== null && allowsFraming(res.headers, ourOrigin);
    await res.body?.cancel().catch(() => {});
  } catch {
    ok = false;
  }
  frameCache.set(url, { ok, at: Date.now() });
  return ok;
}

async function loadFeed(): Promise<AdLink[]> {
  if (feedCache && Date.now() - feedCache.at < SERVER_CONFIG.ads.feedTtlMs) return feedCache.links;
  const res = await fetch(SERVER_CONFIG.ads.feedUrl, {
    signal: AbortSignal.timeout(SERVER_CONFIG.ads.timeoutMs),
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Ads feed HTTP ${res.status}`);
  const feed = FeedSchema.parse(await res.json());
  const seen = new Set<string>();
  const links: AdLink[] = [];
  for (const l of feed.links) {
    const url = safeUrl(l.value);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    links.push({ id: l.id, url });
    if (links.length >= 300) break;
  }
  feedCache = { links, at: Date.now() };
  return links;
}

/** Links from the feed that can actually be shown in the banner. */
export async function getAdLinks(ourOrigin: string): Promise<AdLink[]> {
  const links = await loadFeed();
  const out: AdLink[] = [];
  const deadline = Date.now() + 15_000;
  // Checked in parallel batches; a very long list is finished over later requests (results are cached).
  for (let i = 0; i < links.length && Date.now() < deadline; i += 16) {
    const batch = links.slice(i, i + 16);
    const oks = await Promise.all(batch.map((l) => checkFrame(l.url, ourOrigin)));
    batch.forEach((l, k) => oks[k] && out.push(l));
  }
  return out;
}

/** For tests. */
export function __resetAdCaches() {
  frameCache.clear();
  feedCache = null;
}
