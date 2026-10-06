"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import type { Messages } from "@/i18n";
import { parsePreferences, PREFS_COOKIE, type Preferences } from "@/lib/preferences";
import { ToastProvider } from "@/components/ui/toast";
import { PreferencesProvider, usePrefs } from "./preferences-provider";
import { I18nProvider, useI18n } from "./i18n-provider";
import { QueryProvider } from "./query-provider";
import { ServiceWorkerRegistrar } from "./service-worker";

/**
 * Offline, the service worker may serve a page cached before the user changed
 * settings. Re-apply the current cookie so theme/language/fonts are always right.
 */
function PrefsReconciler() {
  const setPrefs = usePrefs((s) => s.set);
  const current = usePrefs((s) => s);
  const { locale, setLocale } = useI18n();
  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith(`${PREFS_COOKIE}=`))?.slice(PREFS_COOKIE.length + 1);
    if (!raw) return;
    const saved = parsePreferences(raw);
    const changed = (Object.keys(saved) as (keyof Preferences)[]).some((k) => saved[k] !== current[k]);
    if (changed) setPrefs(saved);
    if (saved.locale !== locale) void setLocale(saved.locale);
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function MotionPrefs({ children }: { children: ReactNode }) {
  const reduced = usePrefs((s) => s.reducedMotion);
  // "user" honours the OS setting; the in-app toggle forces it on.
  return <MotionConfig reducedMotion={reduced ? "always" : "user"}>{children}</MotionConfig>;
}

export function AppProviders({
  prefs,
  messages,
  children,
}: {
  prefs: Preferences;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <PreferencesProvider initial={prefs}>
      <I18nProvider initialLocale={prefs.locale} initialMessages={messages}>
        <QueryProvider>
          <MotionPrefs>
            <ToastProvider>
              {children}
              <PrefsReconciler />
              <ServiceWorkerRegistrar />
            </ToastProvider>
          </MotionPrefs>
        </QueryProvider>
      </I18nProvider>
    </PreferencesProvider>
  );
}
