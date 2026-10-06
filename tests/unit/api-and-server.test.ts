import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, apiGet, errorMessageKey } from "@/services/api-client";
import { sanitizeInline, sanitizeRich, stripTags } from "@/server/sanitize";
import { searchLocal, normalize } from "@/features/search/local-index";
import { DUAS } from "@/data/dua/duas";
import { UMRAH_STEPS } from "@/data/guides/umrah";
import { HAJJ_STAGES } from "@/data/guides/hajj";

const S = z.object({ ok: z.boolean() });
const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe("apiGet error handling", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [429, "rateLimited"],
    [500, "server"],
  ])("maps HTTP %i to %s", async (status, kind) => {
    respond(status, {});
    await expect(apiGet("/x", S)).rejects.toMatchObject({ kind });
  });
  it("maps network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(apiGet("/x", S)).rejects.toMatchObject({ kind: "network" });
  });
  it("rejects responses that fail schema validation", async () => {
    respond(200, { ok: "yes" });
    await expect(apiGet("/x", S)).rejects.toMatchObject({ kind: "invalid" });
  });
  it("returns validated data", async () => {
    respond(200, { ok: true });
    await expect(apiGet("/x", S)).resolves.toEqual({ ok: true });
  });
  it("only retries transient errors and has friendly messages", () => {
    expect(new ApiError("notFound").retryable).toBe(false);
    expect(new ApiError("rateLimited").retryable).toBe(true);
    expect(errorMessageKey(new ApiError("rateLimited"))).toBe("errors.rateLimited");
    expect(errorMessageKey(new Error("x"))).toBe("errors.generic");
  });
});

describe("HTML sanitisation", () => {
  it("removes scripts, handlers, links and images", () => {
    const dirty = `<p onclick="x()">Hi<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:x">l</a><sup foot_note="1">1</sup></p>`;
    const rich = sanitizeRich(dirty);
    expect(rich).toBe("<p>Hil<sup>1</sup></p>");
    expect(sanitizeInline("<p>a <em>b</em></p>")).toBe("a <em>b</em>");
    expect(stripTags("<b>x</b>  <i>y</i>")).toBe("x y");
  });
});

describe("religious content integrity", () => {
  it("every dua has Arabic, both translations and at least one reference", () => {
    for (const d of DUAS) {
      expect(d.arabic.trim(), d.id).not.toBe("");
      expect(d.meaning.bn && d.meaning.en, d.id).toBeTruthy();
      expect(d.references.length, d.id).toBeGreaterThan(0);
    }
  });
  it("every guide step cites references and only links to existing duas", () => {
    const ids = new Set(DUAS.map((d) => d.id));
    for (const s of [...UMRAH_STEPS, ...HAJJ_STAGES]) {
      expect(s.references.length, s.id).toBeGreaterThan(0);
      for (const w of s.whatToSay ?? []) expect(ids.has(w.duaId), `${s.id} → ${w.duaId}`).toBe(true);
    }
  });
  it("the Umrah guide has the 13 required steps", () => {
    expect(UMRAH_STEPS).toHaveLength(13);
  });
});

describe("local search", () => {
  it("finds duas in Bangla and English, ignoring Arabic diacritics", () => {
    expect(searchLocal("talbiyah", "en").some((h) => h.id === "talbiyah")).toBe(true);
    expect(searchLocal("তালবিয়াহ", "bn").some((h) => h.id === "talbiyah")).toBe(true);
    expect(searchLocal("لبيك", "en").some((h) => h.id === "talbiyah")).toBe(true);
    expect(normalize("لَبَّيْكَ")).toBe("لبيك");
  });
  it("returns nothing for empty queries", () => {
    expect(searchLocal("   ", "en")).toEqual([]);
  });
});
