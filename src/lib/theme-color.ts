import type { Theme } from "@/lib/preferences";

/**
 * Status-bar colour per theme — the translucent header ("glass") composited
 * over the page background, so the installed app's status bar blends into the
 * header. Android picks dark or light status-bar icons from this colour's
 * luminance, so it must match the real surface for the clock/battery to stay
 * readable. Keep in sync with --glass / --background in globals.css.
 */
export const BAR_COLOR = {
  light: "#fdfaf4",
  dark: "#0f1c17",
  sepia: "#f6eed9",
  mushaf: "#fefaec",
  contrast: "#000000",
} as const satisfies Record<Exclude<Theme, "system">, string>;

export const isDarkTheme = (t: Exclude<Theme, "system">) => t === "dark" || t === "contrast";

/** Server-side theme-color entries (system follows the OS scheme). */
export function themeColorFor(theme: Theme) {
  if (theme === "system")
    return [
      { media: "(prefers-color-scheme: light)", color: BAR_COLOR.light },
      { media: "(prefers-color-scheme: dark)", color: BAR_COLOR.dark },
    ];
  return BAR_COLOR[theme];
}

/**
 * iOS reads apple-mobile-web-app-status-bar-style once at launch.
 * "default" = dark text on a light bar; "black-translucent" = white text over
 * our (dark) header. "system" uses "default" so the clock is always readable.
 */
export const appleStatusBarFor = (theme: Theme) => (theme !== "system" && isDarkTheme(theme) ? "black-translucent" : "default");
