"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card, SectionHeader } from "@/components/ui/card";
import { computeStats } from "@/features/zikr/logic";
import { useZikrStore } from "@/stores/zikr-store";
import type { TKey } from "@/i18n";

const ITEMS: { key: "today" | "yesterday" | "week" | "month" | "total"; label: TKey }[] = [
  { key: "today", label: "zikr.statToday" },
  { key: "yesterday", label: "zikr.statYesterday" },
  { key: "week", label: "zikr.statWeek" },
  { key: "month", label: "zikr.statMonth" },
  { key: "total", label: "zikr.statTotal" },
];

export function ZikrStats() {
  const { t } = useI18n();
  const history = useZikrStore((s) => s.history);
  const stats = useMemo(() => computeStats(history, new Date()), [history]);
  return (
    <section>
      <SectionHeader title={t("zikr.history")} />
      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0 sm:grid-cols-5">
        {ITEMS.map((it, i) => (
          <div key={it.key} className={`bg-card p-4 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
            <p className="text-xs text-muted-foreground">{t(it.label)}</p>
            <AnimatedNumber value={stats[it.key]} className="mt-1 text-2xl font-semibold text-primary" />
          </div>
        ))}
      </Card>
      <p className="mt-2 text-xs text-muted-foreground">{t("zikr.privateNote")}</p>
    </section>
  );
}
