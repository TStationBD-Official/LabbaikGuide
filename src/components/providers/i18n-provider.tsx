"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  contentLocaleFor,
  INTL_LOCALE,
  loadMessages,
  translate,
  type ContentLocale,
  type Messages,
  type TKey,
  type TVars,
} from "@/i18n";
import { isRtl, type Locale } from "@/lib/preferences";
import { usePrefs } from "./preferences-provider";

type I18nValue = {
  locale: Locale;
  contentLocale: ContentLocale;
  intlLocale: string;
  dir: "rtl" | "ltr";
  t: (key: TKey, vars?: TVars) => string;
  formatNumber: (n: number) => string;
  setLocale: (l: Locale) => Promise<void>;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: Locale;
  initialMessages: Messages;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState({ locale: initialLocale, messages: initialMessages });
  const setPrefs = usePrefs((s) => s.set);
  const router = useRouter();

  const setLocale = useCallback(
    async (next: Locale) => {
      // Load the dictionary first so text, `lang` and `dir` switch together.
      const messages = await loadMessages(next);
      setBundle({ locale: next, messages });
      setPrefs({ locale: next });
      // Online: also refresh server-rendered parts (page <title>, metadata). Offline the UI is already fully translated.
      if (navigator.onLine) router.refresh();
    },
    [setPrefs, router],
  );

  const value = useMemo<I18nValue>(() => {
    const intlLocale = INTL_LOCALE[bundle.locale];
    const nf = new Intl.NumberFormat(intlLocale);
    const formatNumber = (n: number) => nf.format(n);
    return {
      locale: bundle.locale,
      contentLocale: contentLocaleFor(bundle.locale),
      intlLocale,
      dir: isRtl(bundle.locale) ? "rtl" : "ltr",
      t: (key, vars) => translate(bundle.messages, key, vars, formatNumber),
      formatNumber,
      setLocale,
    };
  }, [bundle, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
