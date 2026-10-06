import "server-only";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";
import { parsePreferences, PREFS_COOKIE, type Preferences } from "@/lib/preferences";
import { loadMessages, translate, type TKey } from ".";

export async function getServerPreferences(): Promise<Preferences> {
  const store = await cookies();
  return parsePreferences(store.get(PREFS_COOKIE)?.value);
}

export async function getServerT() {
  const prefs = await getServerPreferences();
  const messages = await loadMessages(prefs.locale);
  return { prefs, messages, t: (k: TKey, v?: Record<string, string | number>) => translate(messages, k, v) };
}

/** Per-page metadata in the visitor's language with canonical + OpenGraph. */
export async function pageMetadata(path: string, titleKey: TKey, descriptionKey?: TKey): Promise<Metadata> {
  const { t, prefs } = await getServerT();
  const title = t(titleKey);
  const description = descriptionKey ? t(descriptionKey) : APP_CONFIG.description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${t("app.name")}`, description, url: path, locale: prefs.locale },
    twitter: { card: "summary_large_image", title, description },
  };
}
