import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseLiveFromStreams } from "@/server/live/youtube";
import { LIVE_CHANNELS } from "@/data/live";

const fx = (k: string) => readFileSync(`tests/fixtures/yt-streams-${k}-2026-10-09.txt`, "utf8");

describe("YouTube live parsing", () => {
  it("finds the stream with the LIVE badge and its title (snapshot 9 Oct 2026)", () => {
    expect(parseLiveFromStreams(fx("quran"))).toEqual({ videoId: "eC4LfEVxvKg", title: "بث مباشر || قناة القرآن الكريم Makkah Live" });
    expect(parseLiveFromStreams(fx("sunnah"))?.videoId).toBe("Rs7St51oDDc");
  });
  it("returns null when nothing is live or the page changed", () => {
    expect(parseLiveFromStreams(fx("quran").replaceAll("THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE", "X"))).toBeNull();
    expect(parseLiveFromStreams("<html>consent</html>")).toBeNull();
  });
  it("has the two official channels", () => {
    expect(LIVE_CHANNELS.map((c) => c.channelId)).toEqual(["UCos52azQNBgW63_9uDJoPDA", "UCROKYPep-UuODNwyipe6JMw"]);
  });
});
