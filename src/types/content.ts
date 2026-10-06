import type { ContentLocale } from "@/i18n";

/** Explanatory content authored in Bangla and English. */
export type LText = { bn: string; en: string };

export const lt = (text: LText | string, locale: ContentLocale): string =>
  typeof text === "string" ? text : text[locale] || text.en;

/** A citation for religious content. Every dua/ruling must carry at least one. */
export type Reference = { label: string; detail?: string };

export type Zikr = {
  id: string;
  kind: "default" | "custom";
  name: LText | string;
  arabic: string;
  pronunciation: LText | string;
  meaning: LText | string;
  target: number;
  references?: Reference[];
  /** In-app link to the full text (e.g. a Quran verse) when it is not reproduced here. */
  link?: string;
};

export type DuaCategory =
  | "umrah"
  | "hajj"
  | "tawaf"
  | "sai"
  | "arafah"
  | "muzdalifah"
  | "mina"
  | "travel"
  | "masjid"
  | "forgiveness"
  | "parents"
  | "family"
  | "rizq"
  | "health"
  | "protection"
  | "jannah"
  | "quranic";

export type Dua = {
  id: string;
  categories: DuaCategory[];
  title: LText;
  arabic: string;
  pronunciation: LText;
  meaning: LText;
  references: Reference[];
  note?: LText;
};

export type GuideStep = {
  id: string;
  title: LText;
  summary: LText;
  whatToDo: LText[];
  whatToSay?: { duaId: string; note?: LText }[];
  notes?: LText[];
  dos?: LText[];
  donts?: LText[];
  mistakes?: LText[];
  /** Points where madhhabs/scholars differ; always rendered with a label. */
  differences?: LText[];
  references: Reference[];
  counter?: "tawaf" | "sai";
};

export type HajjStage = GuideStep & {
  when: LText;
  where: LText;
  restrictions?: LText[];
  checklist?: LText[];
};
