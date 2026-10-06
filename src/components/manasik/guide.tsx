"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AlertTriangle, BookMarked, Check, ChevronDown, CircleDot, Footprints, ListChecks, MapPin, RotateCcw, Timer, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Badge, Card, GlassCard } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { DuaCard } from "@/components/dua/dua-card";
import { DUA_BY_ID } from "@/data/dua/duas";
import { HAJJ_STAGES, HAJJ_TYPE_REFS, HAJJ_TYPES } from "@/data/guides/hajj";
import { UMRAH_STEPS } from "@/data/guides/umrah";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useRitualsStore, type HajjType } from "@/stores/rituals-store";
import { lt, type GuideStep, type HajjStage, type LText } from "@/types/content";
import { cn } from "@/lib/utils";

function List({ items, icon, tone }: { items: LText[]; icon: React.ReactNode; tone?: "danger" | "success" }) {
  const { contentLocale } = useI18n();
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-[0.95rem] leading-relaxed">
          <span className={cn("mt-1 shrink-0", tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-gold")} aria-hidden>
            {icon}
          </span>
          <span dir="auto">{lt(it, contentLocale)}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-primary">{title}</h4>
      {children}
    </div>
  );
}

export function GuideStepCard({
  step,
  index,
  done,
  onToggle,
  defaultOpen,
}: {
  step: GuideStep | HajjStage;
  index: number;
  done: boolean;
  onToggle: () => void;
  defaultOpen?: boolean;
}) {
  const { t, contentLocale, formatNumber } = useI18n();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const bodyId = useId();
  const stage = "when" in step ? step : null;
  const dot = <span className="block size-1.5 translate-y-1.5 rounded-full bg-current" />;

  return (
    <li id={`step-${step.id}`} className="scroll-mt-32">
      <Card className={cn("overflow-hidden transition-colors", done && "border-success/50")}>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={done}
            aria-label={`${done ? t("manasik.markUndone") : t("manasik.markDone")}: ${lt(step.title, contentLocale)}`}
            className={cn(
              "grid w-14 shrink-0 place-items-center border-e border-border transition-colors",
              done ? "bg-success text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted",
            )}
          >
            {done ? <Check className="size-5" aria-hidden /> : <span className="text-sm font-semibold">{formatNumber(index + 1)}</span>}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={bodyId}
            className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 text-start"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">{t("manasik.stepN", { n: index + 1 })}</span>
              <span dir="auto" className="block font-semibold">{lt(step.title, contentLocale)}</span>
              <span dir="auto" className="block text-sm text-muted-foreground">{lt(step.summary, contentLocale)}</span>
            </span>
            {step.differences?.length ? <Badge tone="warning" className="hidden sm:inline-flex">{t("manasik.difference")}</Badge> : null}
            <ChevronDown aria-hidden className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        </div>
        {open ? (
          <div id={bodyId} className="space-y-5 border-t border-border px-4 py-5 sm:px-6">
            {stage ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                  <Timer className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-xs text-muted-foreground">{t("manasik.when")}</span>
                    {lt(stage.when, contentLocale)}
                  </span>
                </div>
                <div className="flex gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-xs text-muted-foreground">{t("manasik.where")}</span>
                    {lt(stage.where, contentLocale)}
                  </span>
                </div>
              </div>
            ) : null}
            <Block title={t("manasik.whatToDo")}>
              <List items={step.whatToDo} icon={dot} />
            </Block>
            {step.whatToSay?.length ? (
              <Block title={t("manasik.whatToSay")}>
                <div className="space-y-3">
                  {step.whatToSay.map((w) => {
                    const d = DUA_BY_ID.get(w.duaId);
                    return d ? <DuaCard key={w.duaId} dua={d} compact className="bg-background/60 shadow-none" /> : null;
                  })}
                </div>
              </Block>
            ) : null}
            {step.notes?.length ? (
              <Block title={t("manasik.notes")}>
                <List items={step.notes} icon={<BookMarked className="size-4" />} />
              </Block>
            ) : null}
            {stage?.restrictions?.length ? (
              <Block title={t("manasik.restrictions")}>
                <List items={stage.restrictions} icon={<X className="size-4" />} tone="danger" />
              </Block>
            ) : null}
            {step.dos?.length || step.donts?.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {step.dos?.length ? (
                  <Block title={t("manasik.dos")}>
                    <List items={step.dos} icon={<Check className="size-4" />} tone="success" />
                  </Block>
                ) : null}
                {step.donts?.length ? (
                  <Block title={t("manasik.donts")}>
                    <List items={step.donts} icon={<X className="size-4" />} tone="danger" />
                  </Block>
                ) : null}
              </div>
            ) : null}
            {step.mistakes?.length ? (
              <Block title={t("manasik.mistakes")}>
                <List items={step.mistakes} icon={<AlertTriangle className="size-4" />} tone="danger" />
              </Block>
            ) : null}
            {stage?.checklist?.length ? (
              <Block title={t("manasik.checklist")}>
                <List items={stage.checklist} icon={<ListChecks className="size-4" />} />
              </Block>
            ) : null}
            {step.differences?.map((d, i) => (
              <div key={i} className="rounded-xl border border-warning/40 bg-gold-soft/50 p-3 text-sm">
                <p className="mb-1 font-semibold text-warning">⚖ {t("manasik.difference")}</p>
                <p dir="auto">{lt(d, contentLocale)}</p>
              </div>
            ))}
            {step.counter ? (
              <Link
                href={`/${step.counter}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                {step.counter === "tawaf" ? <CircleDot className="size-4" aria-hidden /> : <Footprints className="size-4" aria-hidden />}
                {t("manasik.openCounter")}: {step.counter === "tawaf" ? t("tawaf.title") : t("sai.title")}
              </Link>
            ) : null}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-gold">{t("manasik.references")}:</span>{" "}
              {step.references.map((r) => r.label + (r.detail ? ` (${r.detail})` : "")).join(" · ")}
            </p>
            <Button variant={done ? "outline" : "primary"} size="sm" onClick={onToggle}>
              <Check className="size-4" aria-hidden />
              {done ? t("manasik.markUndone") : t("manasik.markDone")}
            </Button>
          </div>
        ) : null}
      </Card>
    </li>
  );
}

function GuideProgress({ done, total, onReset }: { done: number; total: number; onReset: () => void }) {
  const { t } = useI18n();
  return (
    <GlassCard className="sticky top-[7.6rem] z-20 p-4 lg:top-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {t("manasik.progress")}: {t("manasik.progressN", { done, total })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm(t("common.confirm"))) onReset();
          }}
          disabled={done === 0}
        >
          <RotateCcw className="size-4" aria-hidden />
          {t("manasik.resetProgress")}
        </Button>
      </div>
      <Progress value={done} max={total} label={t("manasik.progress")} />
      {done === total ? <p className="mt-2 text-sm font-medium text-success" role="status">✦ {t("manasik.completedAll")}</p> : null}
    </GlassCard>
  );
}

export function UmrahGuide() {
  const { t } = useI18n();
  const hydrated = useStoreHydrated(useRitualsStore);
  const doneMap = useRitualsStore((s) => s.umrahDone);
  const toggle = useRitualsStore((s) => s.toggleStep);
  const reset = useRitualsStore((s) => s.resetGuide);
  if (!hydrated) return <SkeletonList rows={5} />;
  const done = UMRAH_STEPS.filter((s) => doneMap[s.id]).length;
  const firstOpen = UMRAH_STEPS.find((s) => !doneMap[s.id])?.id;
  return (
    <div className="space-y-4">
      <UnavailableNotice message={t("common.reviewNotice")} />
      <GuideProgress done={done} total={UMRAH_STEPS.length} onReset={() => reset("umrah")} />
      <ol className="space-y-3">
        {UMRAH_STEPS.map((s, i) => (
          <GuideStepCard key={s.id} step={s} index={i} done={Boolean(doneMap[s.id])} onToggle={() => toggle("umrah", s.id)} defaultOpen={s.id === firstOpen} />
        ))}
      </ol>
    </div>
  );
}

export function HajjGuide() {
  const { t, contentLocale } = useI18n();
  const hydrated = useStoreHydrated(useRitualsStore);
  const doneMap = useRitualsStore((s) => s.hajjDone);
  const hajjType = useRitualsStore((s) => s.hajjType);
  const setHajjType = useRitualsStore((s) => s.setHajjType);
  const toggle = useRitualsStore((s) => s.toggleStep);
  const reset = useRitualsStore((s) => s.resetGuide);
  if (!hydrated) return <SkeletonList rows={5} />;

  const stages = HAJJ_STAGES.filter((s) => !s.onlyFor || s.onlyFor.includes(hajjType));
  const done = stages.filter((s) => doneMap[s.id]).length;
  const type = HAJJ_TYPES.find((h) => h.id === hajjType)!;

  return (
    <div className="space-y-4">
      <UnavailableNotice message={t("common.reviewNotice")} />
      <section>
        <h2 className="mb-2 text-lg font-semibold">{t("manasik.hajjTypes")}</h2>
        <SegmentedControl<HajjType>
          label={t("manasik.hajjTypes")}
          value={hajjType}
          onChange={setHajjType}
          options={HAJJ_TYPES.map((h) => ({ value: h.id, label: lt(h.title, contentLocale) }))}
        />
        <Card className="mt-3 p-4 text-sm leading-relaxed">
          {lt(type.description, contentLocale)}
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-gold">{t("manasik.references")}:</span> {HAJJ_TYPE_REFS.map((r) => r.label).join(" · ")}
          </p>
        </Card>
      </section>
      <GuideProgress done={done} total={stages.length} onReset={() => reset("hajj")} />
      <h2 className="pt-2 text-lg font-semibold">{t("manasik.stages")}</h2>
      <ol className="space-y-3">
        {stages.map((s, i) => (
          <GuideStepCard key={s.id} step={s} index={i} done={Boolean(doneMap[s.id])} onToggle={() => toggle("hajj", s.id)} />
        ))}
      </ol>
    </div>
  );
}
