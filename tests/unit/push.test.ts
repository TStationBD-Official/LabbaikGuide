// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { SignJWT } from "jose";

const sendNotification = vi.fn();
vi.mock("web-push", () => ({ default: { setVapidDetails: vi.fn(), sendNotification: (...a: unknown[]) => sendNotification(...a) } }));

const SIGNING = "sig_test_current_key_123456";
const SUB = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM", auth: "tBHItJI5svbpez7KI4CCXg" } };
const PAYLOAD = { title: "After Fajr", body: "Astaghfirullah ×3", url: "/zikr?plan=salah-fajr", tag: "zikr-salah-fajr" };

async function load() {
  vi.resetModules();
  Object.assign(process.env, {
    VAPID_PUBLIC_KEY: "BPub",
    VAPID_PRIVATE_KEY: "priv",
    QSTASH_TOKEN: "tok",
    QSTASH_URL: "https://qstash.test",
    QSTASH_CURRENT_SIGNING_KEY: SIGNING,
    QSTASH_NEXT_SIGNING_KEY: "sig_next",
    PUSH_SITE_URL: "https://app.test",
  });
  return {
    schedule: await import("@/app/api/push/schedule/route"),
    deliver: await import("@/app/api/push/deliver/route"),
    config: await import("@/app/api/push/config/route"),
  };
}

async function sign(body: string, url: string, key = SIGNING) {
  const hash = createHash("sha256").update(body).digest("base64url");
  return new SignJWT({ body: hash })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("Upstash")
    .setSubject(url)
    .setIssuedAt()
    .setNotBefore(Math.floor(Date.now() / 1000) - 5)
    .setExpirationTime("5m")
    .setJti("jti_1")
    .sign(new TextEncoder().encode(key));
}

const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json", "x-forwarded-for": `1.2.3.${Math.floor(Math.random() * 250)}`, ...headers } });

beforeEach(() => sendNotification.mockReset());
afterEach(() => {
  vi.restoreAllMocks();
  sendNotification.mockReset();
});

describe("push config", () => {
  it("exposes only the public key when enabled", async () => {
    const { config } = await load();
    const json = await config.GET().json();
    expect(json).toEqual({ enabled: true, publicKey: "BPub" });
  });
});

describe("/api/push/schedule", () => {
  it("cancels the previous batch and enqueues delayed QStash messages", async () => {
    const { schedule } = await load();
    const calls: { url: string; init: RequestInit }[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
      calls.push({ url: String(url), init: init! });
      if (String(url).endsWith("/v2/batch")) return new Response(JSON.stringify([{ messageId: "m1" }, { messageId: "m2" }]));
      return new Response("{}");
    });
    const at = Date.now() + 3_600_000;
    const res = await schedule.POST(post("https://app.test/api/push/schedule", { subscription: SUB, items: [{ ...PAYLOAD, at }, { ...PAYLOAD, tag: "t2", at: at + 1000 }], cancel: ["old1"] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ids: ["m1", "m2"] });
    expect(calls[0].url).toBe("https://qstash.test/v2/messages");
    expect(calls[0].init.method).toBe("DELETE");
    const batch = JSON.parse(String(calls[1].init.body));
    expect(batch[0].destination).toBe("https://app.test/api/push/deliver");
    expect(batch[0].headers["Upstash-Not-Before"]).toBe(String(Math.floor(at / 1000)));
    expect(JSON.parse(batch[0].body)).toEqual({ subscription: SUB, payload: PAYLOAD });
  });

  it("rejects unknown push services, external click URLs and oversized batches", async () => {
    const { schedule } = await load();
    const f = vi.spyOn(globalThis, "fetch");
    const bad = [
      { subscription: { ...SUB, endpoint: "https://evil.example/push" }, items: [] },
      { subscription: SUB, items: [{ ...PAYLOAD, url: "https://evil.example", at: Date.now() + 99_999 }] },
      { subscription: SUB, items: Array.from({ length: 41 }, () => ({ ...PAYLOAD, at: Date.now() + 99_999 })) },
    ];
    for (const b of bad) expect((await schedule.POST(post("https://app.test/api/push/schedule", b))).status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });
});

describe("/api/push/deliver", () => {
  it("only accepts correctly signed QStash calls, then sends the push", async () => {
    const { deliver } = await load();
    const body = JSON.stringify({ subscription: SUB, payload: PAYLOAD });
    expect((await deliver.POST(post("https://app.test/api/push/deliver", body))).status).toBe(401);
    const forged = await sign(body, "https://app.test/api/push/deliver", "wrong-key");
    expect((await deliver.POST(post("https://app.test/api/push/deliver", body, { "upstash-signature": forged }))).status).toBe(401);
    const tampered = await sign(body, "https://app.test/api/push/deliver");
    expect((await deliver.POST(post("https://app.test/api/push/deliver", body.replace("Fajr", "Isha"), { "upstash-signature": tampered }))).status).toBe(401);

    sendNotification.mockResolvedValue({ statusCode: 201 });
    const good = await sign(body, "https://app.test/api/push/deliver");
    const res = await deliver.POST(post("https://app.test/api/push/deliver", body, { "upstash-signature": good }));
    expect(res.status).toBe(200);
    expect(sendNotification).toHaveBeenCalledWith(SUB, JSON.stringify(PAYLOAD), expect.objectContaining({ TTL: 3600 }));
  });

  it("treats an expired subscription as final (no QStash retry)", async () => {
    const { deliver } = await load();
    const body = JSON.stringify({ subscription: SUB, payload: PAYLOAD });
    // web-push rejects with a WebPushError carrying statusCode 410 when the subscription is gone.
    sendNotification.mockImplementation(() => Promise.reject(Object.assign(new Error("gone"), { statusCode: 410 })));
    const sig = await sign(body, "https://app.test/api/push/deliver");
    const res = await deliver.POST(post("https://app.test/api/push/deliver", body, { "upstash-signature": sig }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ result: "gone" });
  });
});
