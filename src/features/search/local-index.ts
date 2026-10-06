import { DEFAULT_ZIKR } from "@/data/zikr/defaults";
import { DUAS } from "@/data/dua/duas";
import { HAJJ_STAGES } from "@/data/guides/hajj";
import { UMRAH_STEPS } from "@/data/guides/umrah";
import type { ContentLocale } from "@/i18n";
import { lt, type LText } from "@/types/content";

export type LocalHit = {
  category: "dua" | "umrah" | "hajj" | "zikr";
  id: string;
  title: string;
  snippet: string;
  href: string;
};

type Doc = { category: LocalHit["category"]; id: string; title: LText | string; body: string; href: string };

const flat = (xs: (LText | undefined)[] = []) => xs.filter(Boolean).map((x) => `${x!.bn} ${x!.en}`).join(" ");

const DOCS: Doc[] = [
  ...DUAS.map((d) => ({
    category: "dua" as const,
    id: d.id,
    title: d.title,
    body: `${d.arabic} ${d.pronunciation.bn} ${d.pronunciation.en} ${d.meaning.bn} ${d.meaning.en} ${d.references.map((r) => r.label).join(" ")}`,
    href: `/duas#${d.id}`,
  })),
  ...UMRAH_STEPS.map((s) => ({
    category: "umrah" as const,
    id: s.id,
    title: s.title,
    body: `${s.summary.bn} ${s.summary.en} ${flat(s.whatToDo)} ${flat(s.notes)} ${flat(s.mistakes)}`,
    href: `/umrah#step-${s.id}`,
  })),
  ...HAJJ_STAGES.map((s) => ({
    category: "hajj" as const,
    id: s.id,
    title: s.title,
    body: `${s.summary.bn} ${s.summary.en} ${s.when.bn} ${s.when.en} ${flat(s.whatToDo)} ${flat(s.notes)}`,
    href: `/hajj#step-${s.id}`,
  })),
  ...DEFAULT_ZIKR.map((z) => ({
    category: "zikr" as const,
    id: z.id,
    title: z.name,
    body: `${z.arabic} ${typeof z.meaning === "string" ? z.meaning : `${z.meaning.bn} ${z.meaning.en}`}`,
    href: `/zikr`,
  })),
];

/** Normalise for matching: lower-case, strip Arabic diacritics and tatweel. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[̀-ͯ]/g, "");

const INDEX = DOCS.map((d) => ({ doc: d, haystack: normalize(`${typeof d.title === "string" ? d.title : `${d.title.bn} ${d.title.en}`} ${d.body}`) }));

export function searchLocal(query: string, locale: ContentLocale, limit = 30): LocalHit[] {
  const terms = normalize(query).split(/\s+/).filter((t) => t.length > 0);
  if (!terms.length) return [];
  return INDEX.filter(({ haystack }) => terms.every((t) => haystack.includes(t)))
    .slice(0, limit)
    .map(({ doc }) => {
      const title = lt(doc.title, locale);
      const plain = doc.body.replace(/\s+/g, " ");
      const at = normalize(plain).indexOf(terms[0]);
      const start = Math.max(0, at - 40);
      return {
        category: doc.category,
        id: doc.id,
        title,
        snippet: (start > 0 ? "…" : "") + plain.slice(start, start + 120) + "…",
        href: doc.href,
      };
    });
}
