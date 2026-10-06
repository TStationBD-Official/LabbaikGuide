import type en from "./locales/en.json";
import type { Locale } from "@/lib/preferences";

export type Messages = typeof en;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T & string];

/** Every valid translation key, e.g. "nav.home" — typos fail type-checking. */
export type TKey = Paths<Messages>;
export type TVars = Record<string, string | number>;

const loaders: Record<Locale, () => Promise<Messages>> = {
  bn: () => import("./locales/bn.json").then((m) => m.default as Messages),
  en: () => import("./locales/en.json").then((m) => m.default as Messages),
  ar: () => import("./locales/ar.json").then((m) => m.default as Messages),
  ur: () => import("./locales/ur.json").then((m) => m.default as Messages),
};

export function loadMessages(locale: Locale): Promise<Messages> {
  return loaders[locale]();
}

function lookup(messages: unknown, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

export function translate(
  messages: Messages,
  key: TKey,
  vars?: TVars,
  formatNumber?: (n: number) => string,
): string {
  const template = lookup(messages, key) ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = vars[name];
    if (v === undefined) return `{${name}}`;
    return typeof v === "number" && formatNumber ? formatNumber(v) : String(v);
  });
}

/** BCP-47 tag used for Intl number/date formatting per UI language. */
export const INTL_LOCALE: Record<Locale, string> = {
  bn: "bn-BD",
  en: "en-GB",
  ar: "ar-SA",
  ur: "ur-PK",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
  ar: "العربية",
  ur: "اردو",
};

/**
 * Religious explanatory content (guides, dua meanings) is authored in Bangla and
 * English. Arabic and Urdu UIs fall back to English for explanations; the Arabic
 * source text itself is always shown.
 */
export type ContentLocale = "bn" | "en";
export const contentLocaleFor = (l: Locale): ContentLocale => (l === "bn" ? "bn" : "en");
