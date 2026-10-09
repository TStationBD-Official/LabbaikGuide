import { describe, expect, it } from "vitest";
import bn from "@/i18n/locales/bn.json";
import en from "@/i18n/locales/en.json";
import ar from "@/i18n/locales/ar.json";
import ur from "@/i18n/locales/ur.json";
import { translate } from "@/i18n";
import { DEFAULT_PREFERENCES, htmlAttributes, parsePreferences, serializePreferences } from "@/lib/preferences";

function keys(o: unknown, prefix = ""): string[] {
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === "string" ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`),
  );
}

describe("i18n dictionaries", () => {
  const base = keys(en).sort();
  it.each([["bn", bn], ["ar", ar], ["ur", ur]])("%s has exactly the same keys as en", (_, dict) => {
    expect(keys(dict).sort()).toEqual(base);
  });
  it.each([["bn", bn], ["en", en], ["ar", ar], ["ur", ur]])("%s keeps every {placeholder} of en", (_, dict) => {
    for (const k of base) {
      const get = (o: unknown) => k.split(".").reduce<unknown>((n, p) => (n as Record<string, unknown>)[p], o) as string;
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
      expect(ph(get(dict)), k).toEqual(ph(get(en)));
    }
  });
  it("interpolates and formats numbers", () => {
    const fmt = new Intl.NumberFormat("bn-BD").format;
    expect(translate(bn as typeof en, "quran.ayahN", { n: 45 }, fmt)).toBe("আয়াত ৪৫");
    expect(translate(en, "prayer.iqamah", { time: "5:21 PM" })).toBe("Iqamah 5:21 PM");
  });
  it("keeps the exact required Bangla wording for unavailable schedules", () => {
    expect(bn.prayer.imamUnavailable).toBe("ইমামের সময়সূচি এখন নিশ্চিতভাবে পাওয়া যাচ্ছে না।");
    expect(bn.common.stale).toBe("⚠️ তথ্য পুরোনো হতে পারে");
    expect(en.common.liveUnavailable).toBe("Live information is temporarily unavailable.");
  });
});

describe("preferences cookie", () => {
  it("falls back to defaults for missing or malformed cookies", () => {
    expect(parsePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences("%%%not-json")).toEqual(DEFAULT_PREFERENCES);
  });
  it("rejects tampered values field by field", () => {
    const p = parsePreferences(encodeURIComponent(JSON.stringify({ locale: "ar", theme: "<script>", fontScale: 9999 })));
    expect(p.locale).toBe("ar");
    expect(p.theme).toBe(DEFAULT_PREFERENCES.theme);
    expect(p.fontScale).toBe(DEFAULT_PREFERENCES.fontScale);
  });
  it("round-trips and sets RTL for Arabic/Urdu", () => {
    const p = { ...DEFAULT_PREFERENCES, locale: "ur" as const };
    expect(parsePreferences(serializePreferences(p))).toEqual(p);
    expect(htmlAttributes(p).dir).toBe("rtl");
    expect(htmlAttributes(DEFAULT_PREFERENCES).dir).toBe("ltr");
  });
});

describe("colour themes", () => {
  it("defaults to emerald and rejects unknown accents", () => {
    expect(DEFAULT_PREFERENCES.accent).toBe("emerald");
    expect(parsePreferences(encodeURIComponent(JSON.stringify({ accent: "neon" }))).accent).toBe("emerald");
    expect(parsePreferences(encodeURIComponent(JSON.stringify({ accent: "blue" }))).accent).toBe("blue");
    expect(htmlAttributes({ ...DEFAULT_PREFERENCES, accent: "rose" })["data-accent"]).toBe("rose");
  });
});

describe("Bangla font default", () => {
  it("is Anek Bangla, and old cookies are migrated to it", () => {
    expect(DEFAULT_PREFERENCES.banglaFont).toBe("anek");
    // A v1 cookie (no version) that saved Noto Sans Bengali is migrated.
    expect(parsePreferences(encodeURIComponent(JSON.stringify({ banglaFont: "noto", locale: "bn" }))).banglaFont).toBe("anek");
    // A choice made after the migration is respected.
    expect(parsePreferences(serializePreferences({ ...DEFAULT_PREFERENCES, banglaFont: "hind" })).banglaFont).toBe("hind");
  });
});

describe("12/24-hour preference", () => {
  it("travels with the locale and combines with calendars", async () => {
    const { withHourCycle, withExtension, is24h, PreferencesSchema } = await import("@/lib/preferences");
    const h24 = withHourCycle("bn-BD", "24");
    const fmt = (l: string) => new Intl.DateTimeFormat(l, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(Date.UTC(2026, 0, 1, 15, 30));
    expect(fmt(withHourCycle("en-GB", "12"))).toMatch(/3:30\s?pm/i);
    expect(fmt(withHourCycle("en-GB", "24"))).toBe("15:30");
    expect(is24h(h24)).toBe(true);
    expect(is24h(withHourCycle("ar-SA", "12"))).toBe(false);
    expect(withExtension(h24, "ca", "gregory")).toBe("bn-BD-u-hc-h23-ca-gregory");
    expect(withExtension("bn-BD", "ca", "gregory")).toBe("bn-BD-u-ca-gregory");
    expect(PreferencesSchema.parse({}).timeFormat).toBe("12");
    expect(PreferencesSchema.parse({ timeFormat: "x" }).timeFormat).toBe("12");
  });
});
