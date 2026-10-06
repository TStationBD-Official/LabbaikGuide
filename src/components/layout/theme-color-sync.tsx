"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePrefs } from "@/components/providers/preferences-provider";
import { appleStatusBarFor, BAR_COLOR } from "@/lib/theme-color";

/**
 * Keeps <meta name="theme-color"> in step with the active theme without a
 * reload, so the installed app's status bar always matches the header and the
 * OS picks readable (dark or light) clock/battery icons.
 */
export function ThemeColorSync() {
  const theme = usePrefs((s) => s.theme);
  const path = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = theme === "system" ? (mq.matches ? "dark" : "light") : theme;
      const color = BAR_COLOR[resolved];
      let metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
      if (!metas.length) {
        const m = document.createElement("meta");
        m.name = "theme-color";
        document.head.appendChild(m);
        metas = [m];
      }
      // Same colour on every variant, so whichever media query matches is right.
      for (const m of metas) if (m.content !== color) m.content = color;
      // iOS only reads this at launch; keep it correct for the next start.
      const apple = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (apple) apple.content = appleStatusBarFor(theme);
    };
    apply();
    // Client navigations may re-render head tags; re-apply afterwards.
    const raf = requestAnimationFrame(apply);
    if (theme === "system") mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, [theme, path]);

  return null;
}
