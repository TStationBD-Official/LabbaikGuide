"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import type { Messages } from "@/i18n";
import type { Preferences } from "@/lib/preferences";
import { ToastProvider } from "@/components/ui/toast";
import { PreferencesProvider, usePrefs } from "./preferences-provider";
import { I18nProvider } from "./i18n-provider";
import { QueryProvider } from "./query-provider";
import { ServiceWorkerRegistrar } from "./service-worker";

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
              <ServiceWorkerRegistrar />
            </ToastProvider>
          </MotionPrefs>
        </QueryProvider>
      </I18nProvider>
    </PreferencesProvider>
  );
}
