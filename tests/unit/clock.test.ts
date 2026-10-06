import { describe, expect, it } from "vitest";
import { diffFromMakkah, findZone, isValidTimeZone, tzOffsetMinutes, zoneLabel } from "@/features/clock/timezones";

describe("home clock helpers", () => {
  const d = new Date("2026-10-06T15:05:00Z");
  it("computes offsets and the difference from Makkah", () => {
    expect(tzOffsetMinutes("Asia/Riyadh", d)).toBe(180);
    expect(diffFromMakkah("Asia/Dhaka", d)).toBe(180);
    expect(diffFromMakkah("Asia/Kolkata", d)).toBe(150);
    expect(diffFromMakkah("Asia/Kathmandu", d)).toBe(165);
    expect(diffFromMakkah("Europe/London", d)).toBe(-120); // BST in October
    expect(diffFromMakkah("Europe/London", new Date("2026-12-01T12:00:00Z"))).toBe(-180);
  });
  it("validates zones and labels them", () => {
    expect(isValidTimeZone("Asia/Dhaka")).toBe(true);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
    expect(zoneLabel(findZone("Asia/Dhaka"), "Asia/Dhaka", "en")).toBe("Bangladesh");
    expect(zoneLabel(findZone("America/New_York"), "America/New_York", "en")).toBe("United States · New York");
    expect(zoneLabel(null, "America/Sao_Paulo", "en")).toBe("Sao Paulo");
  });
});
