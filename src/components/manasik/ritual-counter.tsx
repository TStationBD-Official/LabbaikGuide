"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeftRight, Check, ChevronLeft, RotateCcw, Undo2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/progress";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { DuaCard } from "@/components/dua/dua-card";
import { DUA_BY_ID } from "@/data/dua/duas";
import { currentNumber, isComplete, RITUAL_TOTAL, saiDirection } from "@/features/manasik/counter";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useRitualsStore, type RitualKind } from "@/stores/rituals-store";
import { cn, vibrate } from "@/lib/utils";

const DUAS: Record<RitualKind, string[]> = {
  tawaf: ["tawaf-takbir", "rabbana-atina", "maqam-ibrahim"],
  sai: ["safa-verse", "safa-marwah-dhikr"],
};

function RoundDots({ completed, kind }: { completed: number; kind: RitualKind }) {
  const { t, formatNumber } = useI18n();
  return (
    <ol className="flex justify-center gap-2" aria-label={kind === "tawaf" ? t("tawaf.roundsDone", { n: completed }) : t("sai.lengthsDone", { n: completed })}>
      {Array.from({ length: RITUAL_TOTAL }, (_, i) => {
        const n = i + 1;
        const done = n <= completed;
        const current = n === completed + 1;
        return (
          <li
            key={n}
            aria-current={current ? "step" : undefined}
            className={cn(
              "grid size-9 place-items-center rounded-full border text-sm font-semibold transition-colors",
              done ? "border-primary bg-primary text-primary-foreground" : current ? "border-gold text-gold ring-2 ring-gold/30" : "border-border text-muted-foreground",
            )}
          >
            {done ? <Check className="size-4" aria-hidden /> : formatNumber(n)}
            <span className="sr-only">{done ? " ✓" : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

function SaiDirection({ length }: { length: number }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const dir = saiDirection(length);
  const toMarwah = dir === "safa-marwah";
  return (
    <div className="mt-4 w-full max-w-sm">
      <p className="mb-1 text-center text-xs text-muted-foreground">{t("sai.nowWalking")}</p>
      <div className="relative flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3" dir="ltr">
        <span className={cn("text-sm font-semibold", toMarwah ? "text-primary" : "text-muted-foreground")}>{t("sai.safa")}</span>
        <div className="relative mx-3 h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.span
            aria-hidden
            className="absolute top-0 h-1 w-1/3 rounded-full bg-gold"
            animate={reduce ? { left: toMarwah ? "66%" : "0%" } : { left: toMarwah ? ["0%", "66%"] : ["66%", "0%"] }}
            transition={reduce ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className={cn("text-sm font-semibold", !toMarwah ? "text-primary" : "text-muted-foreground")}>{t("sai.marwah")}</span>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center font-semibold" aria-live="polite">
        <ArrowLeftRight className="size-4 text-gold" aria-hidden />
        {toMarwah ? t("sai.safaToMarwah") : t("sai.marwahToSafa")}
      </p>
    </div>
  );
}

function NoteField({ kind, n }: { kind: RitualKind; n: number }) {
  const { t, formatNumber } = useI18n();
  const saved = useRitualsStore((s) => s[kind].notes[n] ?? "");
  const setNote = useRitualsStore((s) => s.setNote);
  const [draft, setDraft] = useState(saved);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync draft when switching rounds
    setDraft(saved);
  }, [saved, n]);
  const id = `${kind}-note`;
  return (
    <div className="mt-5 w-full max-w-sm">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
        {t("tawaf.notes", { n: formatNumber(n) })}
      </label>
      <input
        id={id}
        value={draft}
        maxLength={280}
        placeholder={t("tawaf.notePlaceholder")}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => setNote(kind, n, draft)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
      />
    </div>
  );
}

export function RitualCounterView({ kind }: { kind: RitualKind }) {
  const { t, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(useRitualsStore);
  const counter = useRitualsStore((s) => s[kind]);
  const actions = useRitualsStore.getState;

  if (!hydrated) return <SkeletonList rows={3} />;
  const n = currentNumber(counter);
  const done = isComplete(counter);
  const label = kind === "tawaf" ? t("tawaf.round", { n }) : t("sai.length", { n });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="space-y-6">
        <UnavailableNotice message={kind === "tawaf" ? t("tawaf.noFixedDua") : t("sai.explanation")} />
        <Card className="glass flex flex-col items-center px-4 py-6">
          <CircularProgress value={counter.completed} max={RITUAL_TOTAL} size={240} stroke={12} label={label}>
            <span className="text-sm text-muted-foreground">{kind === "tawaf" ? t("tawaf.title") : t("sai.title")}</span>
            <span className="text-5xl font-bold tabular-nums">
              {formatNumber(done ? RITUAL_TOTAL : n)}
              <span className="text-2xl text-muted-foreground"> / {formatNumber(RITUAL_TOTAL)}</span>
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {kind === "tawaf" ? t("tawaf.roundsDone", { n: counter.completed }) : t("sai.lengthsDone", { n: counter.completed })}
            </span>
          </CircularProgress>

          <div className="mt-5 w-full">
            <RoundDots completed={counter.completed} kind={kind} />
          </div>

          {kind === "sai" && !done ? <SaiDirection length={n} /> : null}
          {kind === "tawaf" && !done ? <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">{t("tawaf.startHint")}</p> : null}

          {done ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mt-5 max-w-sm rounded-xl bg-gold-soft px-4 py-3 text-center text-sm font-medium text-foreground"
            >
              ✦ {kind === "tawaf" ? t("tawaf.complete") : t("sai.complete")}
            </motion.p>
          ) : (
            <NoteField kind={kind} n={n} />
          )}

          <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => actions().back(kind)} disabled={counter.completed === 0} aria-label={t("tawaf.prevRound")}>
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
              <span className="max-sm:sr-only">{t("common.previous")}</span>
            </Button>
            <Button variant="outline" onClick={() => actions().undo(kind)} disabled={counter.past.length === 0}>
              <Undo2 className="size-4" aria-hidden />
              <span className="max-sm:sr-only">{t("common.undo")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm(t("common.confirm"))) actions().reset(kind);
              }}
              disabled={counter.completed === 0}
            >
              <RotateCcw className="size-4" aria-hidden />
              <span className="max-sm:sr-only">{t("common.reset")}</span>
            </Button>
          </div>
          <Button
            size="lg"
            className="mt-3 w-full max-w-sm"
            disabled={done}
            onClick={() => {
              actions().advance(kind);
              vibrate(15);
            }}
          >
            <Check className="size-5" aria-hidden />
            {kind === "tawaf" ? t("tawaf.nextRound") : t("sai.nextLength")}
          </Button>
        </Card>
      </div>
      <section>
        <SectionHeader title={kind === "tawaf" ? t("tawaf.generalDuas") : t("sai.duas")} />
        <div className="space-y-3">
          {DUAS[kind].map((id) => {
            const d = DUA_BY_ID.get(id);
            return d ? <DuaCard key={id} dua={d} compact /> : null;
          })}
        </div>
      </section>
    </div>
  );
}
