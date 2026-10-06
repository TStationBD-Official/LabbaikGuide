"use client";

import { memo } from "react";
import { Bookmark, BookmarkCheck, Copy, Pause, Play, Share2 } from "lucide-react";
import type { QuranVerse } from "@/types/quran";
import type { QuranScriptField } from "@/lib/preferences";
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

export function verseText(v: QuranVerse, field: QuranScriptField): string {
  const primary = field === "text_indopak" ? v.textIndopak : v.textUthmani;
  return primary ?? v.textUthmani ?? v.textIndopak ?? "";
}

type Props = {
  verse: QuranVerse;
  chapterName: string;
  scriptField: QuranScriptField;
  showArabic: boolean;
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
            {verse.words.map((w) => (
              <span key={w.position} className="inline-flex flex-col items-center text-center">
                <span className="font-quran" style={{ lineHeight: 1.7 }}>
                  {w.text}
                </span>
                {w.translation ? (
                  <span dir="auto" className="mt-1 max-w-[9rem] text-xs text-muted-foreground">
                    {w.translation}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p lang="ar" dir="rtl" className="font-quran text-right text-foreground">
            {arabic}
          </p>
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
