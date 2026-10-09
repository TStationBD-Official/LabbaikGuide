import { describe, expect, it } from "vitest";
import { isShortMapLink, parseCoordinates, placeNameFromMapUrl } from "@/features/places/geo";

const PLACE =
  "https://www.google.com/maps/place/Bader+al+Hadeth+Hotel,+3263,+Jarham%D8%8C+3263+8782,+Makkah+24233,+Saudi+Arabia/data=!4m2!3m1!1s0x15c204cd976ceb7f:0x7aab0ba3d8042763!18m1!1e1?coh=192189&entry=gps&g_st=ac";

describe("Google Maps links", () => {
  it("recognises share links that need opening", () => {
    expect(isShortMapLink("https://maps.app.goo.gl/AY1kTJQ4VVsLQnKr5?g_st=ac")).toBe(true);
    expect(isShortMapLink("maps.app.goo.gl/AY1kTJQ4VVsLQnKr5")).toBe(true);
    expect(isShortMapLink("https://goo.gl/maps/abc123")).toBe(true);
    expect(isShortMapLink("https://evil.example/maps.app.goo.gl/x")).toBe(false);
  });

  it("reads the place name when the link has no coordinates", () => {
    expect(parseCoordinates(PLACE)).toBeNull();
    expect(placeNameFromMapUrl(PLACE)).toBe("Bader al Hadeth Hotel, 3263, Jarham، 3263 8782, Makkah 24233, Saudi Arabia");
  });

  it("prefers the pin (!3d!4d) over the view centre (@)", () => {
    const url = "https://www.google.com/maps/place/X/@21.4100,39.8100,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d21.4185!4d39.8262";
    expect(parseCoordinates(url)).toEqual({ lat: 21.4185, lon: 39.8262 });
  });
});
