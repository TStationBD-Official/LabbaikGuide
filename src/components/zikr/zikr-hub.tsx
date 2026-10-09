"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { SegmentedControl } from "@/components/ui/segmented";
import { ZikrPage } from "./zikr-page";
import { ZikrPlans } from "./zikr-plans";
import { useAllZikr, useZikrStore } from "@/stores/zikr-store";

type Tab = "plans" | "free";

/** Zikr: guided after-prayer plans (default) and the free counter. */
export function ZikrHub() {
  const { t } = useI18n();
  const params = useSearchParams();
  const plan = params.get("plan");
  const z = params.get("z");
  const [tab, setTab] = useState<Tab>(plan ? "plans" : params.get("tab") === "free" || z ? "free" : "plans");
  const all = useAllZikr();
  const setActive = useZikrStore((s) => s.setActive);
  // Deep link to one zikr in the free counter (?z=astaghfirullah), e.g. from the daily deeds tracker.
  useEffect(() => {
    if (z && all.some((x) => x.id === z)) setActive(z);
  }, [z, all, setActive]);

  const change = (v: Tab) => {
    setTab(v);
    const url = new URL(window.location.href);
    url.searchParams.delete("plan");
    if (v === "free") url.searchParams.set("tab", "free");
    else url.searchParams.delete("tab");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  };

  return (
    <div className="space-y-6">
      <SegmentedControl
        label={t("zikr.title")}
        value={tab}
        onChange={change}
        options={[
          { value: "plans", label: t("zikrPlan.tabPlans") },
          { value: "free", label: t("zikrPlan.tabFree") },
        ]}
        className="max-w-md"
      />
      {tab === "plans" ? <ZikrPlans initialPlan={plan} /> : <ZikrPage />}
    </div>
  );
}
