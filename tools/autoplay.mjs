import { chromium } from "playwright";
import fs from "node:fs";
const out = [];
const b = await chromium.launch();
for (const [name, ctxOpts] of [["desktop", {}], ["mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36" }]]) {
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  await p.goto("https://labbaikguide.vercel.app/live?ch=makkah", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(15000);
  const frame = p.frames().find((f) => /youtube/.test(f.url()));
  let state = null;
  if (frame) {
    state = await frame.evaluate(() => {
      const v = document.querySelector("video");
      return v ? { paused: v.paused, muted: v.muted, t: v.currentTime, ready: v.readyState } : "no video";
    }).catch((e) => String(e));
  }
  out.push({ name, frame: frame?.url().slice(0, 120) ?? null, state });
  await p.screenshot({ path: `zdata/autoplay-${name}.png` });
  await ctx.close();
}
await b.close();
fs.writeFileSync("zdata/autoplay.json", JSON.stringify(out, null, 1));
