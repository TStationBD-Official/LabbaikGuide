import { afterEach, describe, expect, it, vi } from "vitest";
import { allowedImage, getAbout, orderApps, sizedImage, type AboutApp } from "@/server/about/service";

const ok = (data: unknown) => new Response(JSON.stringify({ success: true, message: "OK", data }), { headers: { "content-type": "application/json" } });

const company = {
  name: "TStationBD",
  logo: "https://tpanel-tstationbd.vercel.app/api/files/abc?v=1",
  banner: null,
  description: "Building apps.",
  longDescription: "",
  supportEmail: null,
  whatsappNumber: "01952788431",
  websiteUrl: "https://tstationbd.vercel.app/",
  playStoreUrl: "https://play.google.com/store/apps/dev?id=1",
  facebookUrl: "not a url",
  featuredAppIds: ["B", "missing", "A"],
};
const app = (id: string, priority = 0, extra: Record<string, unknown> = {}) => ({
  id,
  name: `App ${id}`,
  shortDescription: "x",
  logo: "https://lh3.googleusercontent.com/abc",
  platforms: ["android"],
  priority,
  published: true,
  screenshots: [
    { url: "https://lh3.googleusercontent.com/s2", fileId: "2", order: 1 },
    { url: "https://lh3.googleusercontent.com/s1", fileId: "1", order: 0 },
  ],
  createdBy: "internal-uid",
  ...extra,
});

afterEach(() => vi.unstubAllGlobals());

describe("about: data", () => {
  it("parses company + all app pages, drops bad/unpublished items and internal fields, featured first", async () => {
    const fetchMock = vi.fn(async (input: URL | string) => {
      const u = new URL(String(input));
      if (u.pathname === "/api/company") return ok(company);
      if (u.pathname === "/api/apps" && u.searchParams.get("page") === "1")
        return ok({ items: [app("A", 1), app("C", 9), { id: 1 }], page: 1, pageSize: 100, total: 5, totalPages: 2 });
      if (u.pathname === "/api/apps") return ok({ items: [app("B"), app("D", 0, { published: false })], page: 2, pageSize: 100, total: 5, totalPages: 2 });
      return new Response("nope", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const d = await getAbout();
    expect(d.company.name).toBe("TStationBD");
    expect(d.company.facebookUrl).toBeNull(); // invalid URL never becomes a link
    expect(d.apps.map((a) => a.id)).toEqual(["B", "A", "C"]); // featured order, then priority
    expect(d.apps[0].screenshots).toEqual(["https://lh3.googleusercontent.com/s1", "https://lh3.googleusercontent.com/s2"]);
    expect(d.apps[0]).not.toHaveProperty("createdBy");
    // Every upstream call is cached and tagged for instant refresh.
    for (const [, init] of fetchMock.mock.calls as unknown as [string, RequestInit & { next?: { tags?: string[]; revalidate?: number } }][]) {
      expect(init.next?.tags).toContain("about");
      expect(init.next?.revalidate).toBe(300);
    }
  });

  it("throws (page shows 'temporarily unavailable') when the panel is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("err", { status: 500 })));
    await expect(getAbout()).rejects.toThrow();
  });

  it("orders featured apps by the company's list", () => {
    const apps = ["x", "y", "z"].map((id, i) => ({ id, name: id, priority: i }) as unknown as AboutApp);
    expect(orderApps(apps, ["y"]).map((a) => a.id)).toEqual(["y", "z", "x"]);
  });
});

describe("about: images", () => {
  it("only proxies images from the panel and Google image hosts", () => {
    expect(allowedImage("https://lh3.googleusercontent.com/abc")).not.toBeNull();
    expect(allowedImage("https://tpanel-web.vercel.app/api/files/x?v=1")).not.toBeNull();
    expect(allowedImage("https://tpanel-tstationbd.vercel.app/api/files/x")).not.toBeNull();
    for (const bad of ["https://evil.com/a.png", "http://lh3.googleusercontent.com/a", "https://localhost/a", "https://other.vercel.app/a", "x"])
      expect(allowedImage(bad), bad).toBeNull();
  });

  it("asks Google for a resized copy", () => {
    expect(sizedImage(new URL("https://lh3.googleusercontent.com/abc"), 480).toString()).toBe("https://lh3.googleusercontent.com/abc=w480");
    expect(sizedImage(new URL("https://lh3.googleusercontent.com/abc=w2000"), 96).toString()).toBe("https://lh3.googleusercontent.com/abc=w96");
    expect(sizedImage(new URL("https://tpanel-web.vercel.app/api/files/x?v=1"), 96).toString()).toBe("https://tpanel-web.vercel.app/api/files/x?v=1");
  });
});
