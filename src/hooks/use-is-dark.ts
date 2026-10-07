"use client";

import { useSyncExternalStore } from "react";
import { usePrefs } from "@/components/providers/preferences-provider";

const DARK_MQ = "(prefers-color-scheme: dark)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DARK_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** The operating system prefers a dark scheme. */
export function useOsDark() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DARK_MQ).matches, () => false);
}

/** The app is currently shown on a dark background (dark, high contrast, or system → dark). */
export function useIsDark() {
  const theme = usePrefs((s) => s.theme);
  const os = useOsDark();
  return theme === "dark" || theme === "contrast" || (theme === "system" && os);
}
