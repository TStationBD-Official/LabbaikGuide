"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { Button, IconButton } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonList } from "@/components/ui/states";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useAllZikr, useZikrStore } from "@/stores/zikr-store";
import { lt, type Zikr } from "@/types/content";
import { cn } from "@/lib/utils";
import { ZikrCounter } from "./zikr-counter";
import { ZikrForm } from "./zikr-form";
import { ZikrStats } from "./zikr-stats";

function ZikrItem({
  zikr,
  index,
  total,
  active,
  onEdit,
}: {
  zikr: Zikr;
  index: number;
  total: number;
  active: boolean;
  onEdit: (z: Zikr) => void;
}) {
  const { t, contentLocale, formatNumber } = useI18n();
  const count = useZikrStore((s) => s.counts[zikr.id] ?? 0);
  const target = useZikrStore((s) => s.targets[zikr.id] ?? zikr.target);
  const store = useZikrStore.getState;
  const name = lt(zikr.name, contentLocale);

  return (
    <li
      className={cn(
        "rounded-2xl border bg-card p-3 transition-colors",
        active ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => {
          store().setActive(zikr.id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        aria-pressed={active}
        className="flex w-full items-start gap-3 text-start"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium">{name}</span>
            {zikr.kind === "custom" ? <Badge tone="gold">{t("zikr.custom")}</Badge> : null}
          </span>
          {zikr.arabic ? (
            <span lang="ar" dir="rtl" className="font-arabic mt-0.5 block truncate text-lg text-primary">
              {zikr.arabic}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {formatNumber(count)}/{formatNumber(target)}
        </span>
      </button>
      <Progress className="mt-2" value={Math.min(count, target)} max={target} label={`${name}: ${t("zikr.progress", { count, target })}`} />
      <div className="mt-2 flex items-center justify-end gap-0.5">
        <IconButton size="sm" label={`${t("common.moveUp")}: ${name}`} disabled={index === 0} onClick={() => store().move(zikr.id, -1)}>
          <ArrowUp className="size-4" aria-hidden />
        </IconButton>
        <IconButton size="sm" label={`${t("common.moveDown")}: ${name}`} disabled={index === total - 1} onClick={() => store().move(zikr.id, 1)}>
          <ArrowDown className="size-4" aria-hidden />
        </IconButton>
        <IconButton size="sm" label={`${t("common.duplicate")}: ${name}`} onClick={() => store().duplicate(zikr.id)}>
          <Copy className="size-4" aria-hidden />
        </IconButton>
        {zikr.kind === "custom" ? (
          <>
            <IconButton size="sm" label={`${t("common.edit")}: ${name}`} onClick={() => onEdit(zikr)}>
              <Pencil className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              size="sm"
              label={`${t("common.delete")}: ${name}`}
              onClick={() => {
                if (window.confirm(t("zikr.deleteConfirm"))) store().deleteCustom(zikr.id);
              }}
            >
              <Trash2 className="size-4 text-danger" aria-hidden />
            </IconButton>
          </>
        ) : null}
      </div>
    </li>
  );
}

export function ZikrPage() {
  const { t } = useI18n();
  const hydrated = useStoreHydrated(useZikrStore);
  const all = useAllZikr();
  const activeId = useZikrStore((s) => s.activeId);
  const addCustom = useZikrStore((s) => s.addCustom);
  const updateCustom = useZikrStore((s) => s.updateCustom);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Zikr | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (!hydrated) return <SkeletonList rows={3} />;
  const active = all.find((z) => z.id === activeId) ?? all[0];

  const openNew = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };
  const openEdit = (z: Zikr) => {
    setEditing(z);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };
  const str = (v: Zikr["name"]) => (typeof v === "string" ? v : v.bn);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="space-y-8">
        <Card className="glass px-4 py-6 sm:px-8">{active ? <ZikrCounter key={active.id} zikr={active} /> : null}</Card>
        <ZikrStats />
      </div>
      <section>
        <SectionHeader
          title={t("zikr.collection")}
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="size-4" aria-hidden />
              {t("zikr.addCustom")}
            </Button>
          }
        />
        <ul className="space-y-2">
          {all.map((z, i) => (
            <ZikrItem key={z.id} zikr={z} index={i} total={all.length} active={z.id === active?.id} onEdit={openEdit} />
          ))}
        </ul>
      </section>
      <ZikrForm
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("zikr.editCustom") : t("zikr.addCustom")}
        initial={
          editing
            ? {
                name: str(editing.name),
                arabic: editing.arabic,
                pronunciation: str(editing.pronunciation),
                meaning: str(editing.meaning),
                target: String(editing.target),
              }
            : undefined
        }
        onSubmit={(v) => (editing ? updateCustom(editing.id, v) : addCustom(v))}
      />
    </div>
  );
}
