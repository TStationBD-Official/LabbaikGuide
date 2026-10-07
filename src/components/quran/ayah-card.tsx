"use client";

import { memo } from "react";
import { Bookmark, BookmarkCheck, Copy, Pause, Play, Share2 } from "lucide-react";
import type { QuranVerse } from "@/types/quran";
import type { QuranScriptField } from "@/lib/preferences";
import { qcfFamily, qcfPalette, type QcfVariant } from "@/hooks/use-qcf-fonts";
import { useI18n } from "@/components/providers/i18n-provider";
import { useToast } from "@/components/ui/toast";
import { IconButton } from "@/components/ui/button";
import { useInViewOnce } from "@/hooks/use-misc";
import { copyText, shareOrCopy, cn } from "@/lib/utils";
import { TafsirPanel } from "./tafsir-panel";

/** Plain text from sanitized translation HTML, dropping footnote markers. */
function htmlToText(html: string): string {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  tpl.content.querySelectorAll("sup").forEach((n) => n.remove());
  return (tpl.content.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Unicode Arabic for a script (used for display and for copy/share). QCF page
 * fonts are glyph codes, not readable text, so copying uses the KFGQPC Unicode
 * text of the same Mushaf.
 */
export function verseText(v: QuranVerse, field: QuranScriptField): string {
  const primary =
    field === "text_indopak" ? v.textIndopak : field === "text_uthmani" ? v.textUthmani : (v.textQpcHafs ?? v.textUthmani);
  return primary ?? v.textUthmani ?? v.textIndopak ?? "";
}

/** One glyph per word in the font of its own Mushaf page. */
function QcfLine({ glyphs, variant, dark }: { glyphs: { p: number; c: string }[]; variant: QcfVariant; dark: boolean }) {
  return (
    <>
      {glyphs.map((g, i) => (
        <span key={i} style={{ fontFamily: qcfFamily(variant, g.p), fontPalette: qcfPalette(variant, g.p, dark) }}>
          {g.c}
          {i < glyphs.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

type Props = {
  verse: QuranVerse;
  chapterName: string;
  scriptField: QuranScriptField;
  /** Set when a King Fahd Complex page font is selected. */
  qcf: { variant: QcfVariant; ready: (page: number) => boolean; dark: boolean } | null;
  showArabic: boolean;
  /** Bengali pronunciation: string, null = unavailable for this verse, undefined = off/loading. */
  uccharon?: string | null;
  showTranslation: boolean;
  showTafsir: boolean;
  wordByWord: boolean;
  audioEnabled: boolean;
  tafsirId: number | null;
  bookmarked: boolean;
  playing: boolean;
  highlighted: boolean;
  onToggleBookmark: (v: QuranVerse) => void;
  onPlay: (v: QuranVerse) => void;
};

export const AyahCard = memo(function AyahCard(p: Props) {
  const { t, formatNumber } = useI18n();
  const toast = useToast();
  const { ref, seen } = useInViewOnce<HTMLElement>("400px");
  const { verse } = p;
  const arabic = verseText(verse, p.scriptField);
  // Glyphs are used only when every page font this verse needs has loaded.
  const glyphs = p.qcf && verse.qcf && verse.qcf.glyphs.every((g) => p.qcf!.ready(g.p)) ? verse.qcf.glyphs : null;

  const shareBody = () => {
    // Quran text is shared exactly as received — never altered.
    const parts = [arabic];
    if (verse.translationHtml) parts.push(htmlToText(verse.translationHtml));
    parts.push(`— ${p.chapterName} ${verse.key}`);
    return parts.join("\n\n");
  };

  return (
    <article
      ref={ref}
      id={`ayah-${verse.key.replace(":", "-")}`}
      data-verse-key={verse.key}
      aria-label={`${p.chapterName} ${verse.key}`}
      className={cn(
        "scroll-mt-40 rounded-2xl border bg-[var(--quran-bg)] p-4 transition-colors sm:p-6",
        p.highlighted || p.playing ? "border-gold ring-2 ring-gold/30" : "border-border",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-gold/60 px-2 text-sm font-semibold text-gold">
          {formatNumber(verse.chapterId)}:{formatNumber(verse.number)}
        </span>
        <div className="flex items-center gap-0.5">
          {p.audioEnabled && verse.audioUrl ? (
            <IconButton size="sm" label={p.playing ? t("quran.pause") : t("quran.play")} onClick={() => p.onPlay(verse)}>
              {p.playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            </IconButton>
          ) : null}
          <IconButton
            size="sm"
            label={p.bookmarked ? t("quran.removeBookmark") : t("quran.bookmark")}
            pressed={p.bookmarked}
            onClick={() => p.onToggleBookmark(verse)}
          >
            {p.bookmarked ? <BookmarkCheck className="size-4 text-gold" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
          </IconButton>
          <IconButton
            size="sm"
            label={t("quran.copyAyah")}
            onClick={async () => toast((await copyText(shareBody())) ? t("common.copied") : t("errors.generic"))}
          >
            <Copy className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            label={t("quran.shareAyah")}
            onClick={async () => {
              const r = await shareOrCopy({ title: `${p.chapterName} ${verse.key}`, text: shareBody() });
              if (r === "copied") toast(t("common.copied"));
            }}
          >
            <Share2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </header>

      {p.showArabic ? (
        p.wordByWord && verse.words?.length ? (
          <div lang="ar" dir="rtl" className="flex flex-wrap gap-x-3 gap-y-4">
            {verse.words.map((w, i) => (
              <span key={w.position} className="inline-flex flex-col items-center text-center">
                {glyphs?.[i] && p.qcf ? (
                  <span className="font-quran" style={{ lineHeight: 1.7, fontFamily: qcfFamily(p.qcf.variant, glyphs[i].p), fontPalette: qcfPalette(p.qcf.variant, glyphs[i].p, p.qcf.dark) }}>
                    {glyphs[i].c}
                  </span>
                ) : (
                  <span className="font-quran" style={{ lineHeight: 1.7 }}>
                    {w.text}
                  </span>
                )}
                {w.translation ? (
                  <span dir="auto" className="mt-1 max-w-[9rem] text-xs text-muted-foreground">
                    {w.translation}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p lang="ar" dir="rtl" className={cn("font-quran text-right text-foreground", glyphs && "qcf-line")}>
            {glyphs && p.qcf ? <QcfLine glyphs={glyphs} variant={p.qcf.variant} dark={p.qcf.dark} /> : arabic}
          </p>
        )
      ) : null}

      {p.uccharon !== undefined ? (
        p.uccharon ? (
          <p lang="bn" className={cn("text-[1.05rem] leading-8 text-primary", p.showArabic && "mt-3")}>
            {p.uccharon}
          </p>
        ) : (
          <p className={cn("text-xs text-muted-foreground", p.showArabic && "mt-3")}>{t("quran.bnUccharonMissing")}</p>
        )
      ) : null}

      {p.showTranslation && verse.translationHtml ? (
        <p
          dir="auto"
          className={cn("text-[1.02rem] leading-8 text-foreground/90", p.showArabic && "mt-4 border-t border-border/70 pt-4")}
          // Sanitized on the server (inline formatting + footnote <sup> only).
          dangerouslySetInnerHTML={{ __html: verse.translationHtml }}
        />
      ) : null}

      <TafsirPanel tafsirId={p.tafsirId} verseKey={verse.key} active={p.showTafsir && seen} />
    </article>
  );
});
