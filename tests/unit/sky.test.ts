import { describe, expect, it } from "vitest";
import { calculatePrayerDay } from "@/features/prayer/times";
import { nightTimes } from "@/features/prayer/night";
import { skyAt } from "@/components/prayer/sky-backdrop";

const day = calculatePrayerDay("makkah", { year: 2026, month: 10, day: 8 });
const at = (n: string) => day.prayers.find((p) => p.name === n)!.adhan.getTime();
const sky = (ms: number) => {
  const now = new Date(ms);
  return skyAt(day, now, nightTimes("makkah", now).lastThird);
};

describe("sky follows the prayer times", () => {
  it("switches exactly at each prayer time", () => {
    expect(sky(at("fajr") - 60_000).waqt).toBe("tahajjud");
    expect(sky(at("fajr")).waqt).toBe("fajr");
    expect(sky(at("sunrise") - 1).waqt).toBe("fajr");
    expect(sky(at("sunrise")).waqt).toBe("duha");
    expect(sky(at("dhuhr") - 1).waqt).toBe("duha");
    expect(sky(at("dhuhr")).waqt).toBe("dhuhr");
    expect(sky(at("asr")).waqt).toBe("asr");
    expect(sky(at("maghrib") - 1).waqt).toBe("asr");
    expect(sky(at("maghrib")).waqt).toBe("maghrib");
    expect(sky(at("isha")).waqt).toBe("isha");
  });

  it("reports how far through the waqt it is", () => {
    const mid = (at("asr") + at("maghrib")) / 2;
    expect(sky(mid).f).toBeCloseTo(0.5, 2);
    expect(sky(at("dhuhr")).f).toBe(0);
  });
});
