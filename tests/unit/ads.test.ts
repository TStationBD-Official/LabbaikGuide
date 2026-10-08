import { afterEach, describe, expect, it, vi } from "vitest";
import { __resetAdCaches, allowsFraming, getAdLinks, safeUrl } from "@/server/ads/service";
import { shuffle } from "@/components/layout/ad-banner";

const ORIGIN = "https://labbaikguide.vercel.app";
const h = (o: Record<string, string>) => new Headers(o);

describe("ads: url safety", () => {
  it("accepts public https pages only", () => {
    expect(safeUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    for (const bad of ["http://example.com", "javascript:alert(1)", "https://localhost/x", "https://127.0.0.1", "https://[::1]/", "https://intranet", "https://a.internal", "https://u:p@example.com", "nope"]) {
      expect(safeUrl(bad), bad).toBeNull();
    }
  });
});

describe("ads: frame check", () => {
  it("rejects X-Frame-Options and restrictive frame-ancestors", () => {
    expect(allowsFraming(h({}), ORIGIN)).toBe(true);
    expect(allowsFraming(h({ "x-frame-options": "DENY" }), ORIGIN)).toBe(false);
    expect(allowsFraming(h({ "x-frame-options": "SAMEORIGIN" }), ORIGIN)).toBe(false);
    expect(allowsFraming(h({ "content-security-policy": "default-src 'self'; frame-ancestors 'none'" }), ORIGIN)).toBe(false);
    expect(allowsFraming(h({ "content-security-policy": "frame-ancestors 'self' https://other.com" }), ORIGIN)).toBe(false);
    expect(allowsFraming(h({ "content-security-policy": "frame-ancestors *" }), ORIGIN)).toBe(true);
    expect(allowsFraming(h({ "content-security-policy": "frame-ancestors https://*.vercel.app" }), ORIGIN)).toBe(true);
    expect(allowsFraming(h({ "content-security-policy": "script-src 'self'" }), ORIGIN)).toBe(true);
  });
});

describe("ads: feed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    __resetAdCaches();
  });

  it("keeps valid, unique, frameable links and drops the rest", async () => {
    const feed = {
      links: [
        { id: "1", type: "test", value: "https://ok.example.com" },
        { id: "2", type: "test", value: "https://ok.example.com" }, // duplicate
        { id: "3", type: "test", value: "http://insecure.example.com" },
        { id: "4", type: "test", value: "https://denied.example.com" },
        { id: 5, type: "test", value: "https://down.example.com" },
        { id: "6", type: "test", value: "https://ok2.example.com/page" },
      ],
    };
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes("ad-links")) return new Response(JSON.stringify(feed), { headers: { "content-type": "application/json" } });
      if (url.includes("denied")) return new Response("x", { headers: { "x-frame-options": "DENY" } });
      if (url.includes("down")) return new Response("x", { status: 503 });
      const r = new Response("<html></html>");
      Object.defineProperty(r, "url", { value: url });
      return r;
    });
    vi.stubGlobal("fetch", fetchMock);
    const links = await getAdLinks(ORIGIN);
    expect(links.map((l) => l.url)).toEqual(["https://ok.example.com/", "https://ok2.example.com/page"]);
    // Second call within the cache window: no new requests.
    const calls = fetchMock.mock.calls.length;
    await getAdLinks(ORIGIN);
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it("fails loudly when the feed is unavailable (the route then returns an empty list)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("err", { status: 500 })));
    await expect(getAdLinks(ORIGIN)).rejects.toThrow();
  });
});

describe("ads: random order", () => {
  it("is a permutation and a reshuffle never repeats the last site first", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({ id: String(i), url: `https://s${i}.example.com/` }));
    for (let n = 0; n < 200; n++) {
      const d = shuffle(items, items[2].url);
      expect(new Set(d.map((x) => x.id)).size).toBe(6);
      expect(d[0].url).not.toBe(items[2].url);
    }
    const firsts = new Set(Array.from({ length: 200 }, () => shuffle(items)[0].id));
    expect(firsts.size).toBeGreaterThan(3);
  });
});
