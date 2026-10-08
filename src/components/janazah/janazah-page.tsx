"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Info, Pause, Play, RotateCcw } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { JanazahScene } from "@/components/janazah/janazah-scene";
import { gt, type GText } from "@/data/guides/travel";
import {
  DUROOD,
  duasFor,
  FATIHA,
  HARAM_TIPS,
  poseAt,
  RULINGS,
  SALAM,
  STEPS,
  THANA,
  type Deceased,
  type JRef,
  type JStep,
  type JText,
  type Method,
} from "@/data/guides/janazah";
import { cn } from "@/lib/utils";

/** Followers act a moment after hearing the imam. */
const LAG = 380;
const TICK = 100;

const ACTION: Record<string, GText> = {
  niyyah: { en: "Intention in the heart", bn: "মনে মনে নিয়ত", ur: "دل میں نیت" },
  fatiha: { en: "al-Fatiha, silently", bn: "নিঃশব্দে ফাতিহা", ur: "آہستہ فاتحہ" },
  thana: { en: "Thana, silently", bn: "নিঃশব্দে সানা", ur: "آہستہ ثنا" },
  durood: { en: "Durood Ibrahim", bn: "দরুদে ইবরাহিম", ur: "درودِ ابراہیمی" },
  dua: { en: "Dua for the deceased", bn: "মৃতের জন্য দোয়া", ur: "میت کے لیے دعا" },
  pause: { en: "A short pause", bn: "সামান্য বিরতি", ur: "ذرا ٹھہریں" },
  salam: { en: "Salam", bn: "সালাম", ur: "سلام" },
  done: { en: "The prayer is complete", bn: "নামাজ সম্পন্ন", ur: "نماز مکمل" },
};

function actionFor(step: JStep, t: number, method: Method, saying: string | null): string {
  if (saying === "takbir") return "takbir";
  if (step.takbir === 0) return "niyyah";
  if (step.takbir === 1) return method === "hanafi" ? "thana" : "fatiha";
  if (step.takbir === 2) return "durood";
  if (step.takbir === 3) return "dua";
  if (saying === "salam") return "salam";
  return t < 4600 ? "pause" : "done";
}

function textsFor(step: JStep, method: Method, deceased: Deceased): { texts: JText[]; note?: GText } {
  if (step.takbir === 1) return { texts: [method === "hanafi" ? THANA : FATIHA] };
  if (step.takbir === 2) return { texts: [DUROOD] };
  if (step.takbir === 3) return duasFor(deceased);
  if (step.takbir === 4) return { texts: [SALAM] };
  return { texts: [] };
}

function Refs({ refs }: { refs: JRef[] }) {
  const { locale } = useI18n();
  if (!refs.length) return null;
  return (
    <ul className="space-y-0.5 text-xs text-muted-foreground">
      {refs.map((r) => (
        <li key={r.label}>
          <span className="font-medium text-gold">{r.label}</span>
          {r.detail ? <span dir="auto"> — {gt(r.detail, locale)}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function TextCard({ text }: { text: JText }) {
  const { t, locale } = useI18n();
  return (
    <li className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <p className="font-semibold">{gt(text.title, locale)}</p>
      <p lang="ar" dir="rtl" className="font-arabic text-right text-xl leading-loose text-primary">
        {text.arabic}
      </p>
      <p className="text-sm italic text-muted-foreground" dir="auto">
        {gt(text.translit, locale)}
      </p>
      <p className="text-sm leading-relaxed" dir="auto">
        {gt(text.meaning, locale)}
      </p>
      {text.note ? (
        <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-2.5 text-xs" dir="auto">
          <Info className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
          {gt(text.note, locale)}
        </p>
      ) : null}
      <Refs refs={text.refs} />
      {text.link ? (
        <Link href={text.link} className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <BookOpen className="size-4" aria-hidden />
          {t("janazah.openQuran")}
        </Link>
      ) : null}
    </li>
  );
}

export function JanazahPage() {
  const { t, locale } = useI18n();
  const [deceased, setDeceased] = useState<Deceased>("man");
  const [method, setMethod] = useState<Method>(locale === "en" || locale === "ar" ? "haramain" : "hanafi");
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setElapsed((e) => e + TICK);
    }, TICK);
    return () => window.clearInterval(id);
  }, [playing]);

  // Move to the next step when this one has finished playing (stop after the last).
  const finished = elapsed >= step.ms + LAG;
  useEffect(() => {
    if (!playing || !finished) return;
    const id = window.setTimeout(() => {
      if (last) setPlaying(false);
      else {
        setIndex((i) => i + 1);
        setElapsed(0);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [playing, finished, last]);

  const go = (i: number) => {
    setIndex(Math.max(0, Math.min(STEPS.length - 1, i)));
    setElapsed(0);
  };
  const imam = poseAt(step, elapsed, method);
  const follower = poseAt(step, elapsed - LAG, method);
  const saying = imam.saying === "takbir" ? "اللّٰهُ أَكْبَر" : imam.saying === "salam" ? "السَّلَامُ عَلَيْكُم" : null;
  const action = actionFor(step, elapsed, method, imam.saying);
  const { texts, note } = useMemo(() => textsFor(step, method, deceased), [step, method, deceased]);
  const progress = Math.min(1, elapsed / step.ms);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="relative">
          <JanazahScene
            imamPose={imam.pose}
            followerPose={follower.pose}
            deceased={deceased}
            saying={saying}
            label={`${gt(step.title, locale)} — ${t("janazah.sceneLabel")}`}
            youLabel={t("janazah.you")}
          />
          {/* takbir counter */}
          <div className="absolute end-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[10px] font-bold transition-colors",
                  step.takbir >= n ? "bg-gold text-black" : "bg-white/20 text-white/80",
                )}
              >
                {n}
              </span>
            ))}
          </div>
          <p className="absolute bottom-2 start-2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm" aria-live="polite">
            {action === "takbir" ? `${t("janazah.takbir")} · Allāhu akbar` : gt(ACTION[action], locale)}
          </p>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium hover:bg-muted disabled:opacity-40">
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t("janazah.prev")}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!playing && last && finished) go(0);
                setPlaying((p) => !p);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {playing ? t("janazah.pause") : t("janazah.play")}
            </button>
            <button
              type="button"
              onClick={() => {
                go(0);
                setPlaying(true);
              }}
              aria-label={t("janazah.replay")}
              className="grid size-11 place-items-center rounded-xl border border-border hover:bg-muted"
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          </div>
          <button type="button" onClick={() => go(index + 1)} disabled={last} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium hover:bg-muted disabled:opacity-40">
            {t("janazah.next")}
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t("janazah.deceased")}</p>
          <SegmentedControl<Deceased>
            label={t("janazah.deceased")}
            value={deceased}
            onChange={setDeceased}
            size="sm"
            options={[
              { value: "man", label: t("janazah.man") },
              { value: "woman", label: t("janazah.woman") },
              { value: "child", label: t("janazah.child") },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t("janazah.method")}</p>
          <SegmentedControl<Method>
            label={t("janazah.method")}
            value={method}
            onChange={setMethod}
            size="sm"
            options={[
              { value: "haramain", label: t("janazah.haramain") },
              { value: "hanafi", label: t("janazah.hanafi") },
            ]}
          />
        </div>
      </div>

      {/* step list */}
      <ol className="flex gap-2 overflow-x-auto pb-1" aria-label={t("janazah.steps")}>
        {STEPS.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "min-h-10 rounded-full border px-3 text-sm font-medium transition-colors",
                i === index ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-gold",
              )}
            >
              {s.takbir === 0 ? t("janazah.niyyahShort") : t("janazah.takbirN", { n: String(s.takbir) })}
            </button>
          </li>
        ))}
      </ol>

      <section className="space-y-3" aria-labelledby="jz-step">
        <h2 id="jz-step" className="text-lg font-semibold">
          {index + 1}. {gt(step.title, locale)}
        </h2>
        <p className="text-sm leading-relaxed" dir="auto">
          {gt(step.body, locale)}
        </p>
        {step.takbir === 0 ? (
          <p className="text-sm text-muted-foreground">{t(deceased === "woman" ? "janazah.posWoman" : deceased === "child" ? "janazah.posChild" : "janazah.posMan")}</p>
        ) : null}
        {texts.length ? (
          <ul className="space-y-3">
            {texts.map((x) => (
              <TextCard key={x.id} text={x} />
            ))}
          </ul>
        ) : null}
        {note ? (
          <p className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-soft/40 p-3 text-sm" dir="auto">
            <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <span lang="und">{gt(note, locale)}</span>
          </p>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="jz-rules">
        <h2 id="jz-rules" className="text-lg font-semibold">
          {t("janazah.rulings")}
        </h2>
        <ul className="space-y-2">
          {RULINGS.map((r) => (
            <li key={r.id} className="space-y-1 rounded-2xl border border-border bg-card p-3.5">
              <p className="text-sm leading-relaxed" dir="auto">
                {gt(r.text, locale)}
              </p>
              <Refs refs={r.refs} />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="jz-haram">
        <h2 id="jz-haram" className="text-lg font-semibold">
          🕋 {t("janazah.inHaramain")}
        </h2>
        <ul className="list-disc space-y-1.5 ps-5 text-sm leading-relaxed marker:text-gold">
          {HARAM_TIPS.map((tip, i) => (
            <li key={i} dir="auto">
              {gt(tip, locale)}
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t("janazah.artNote")}
      </p>
    </div>
  );
}
