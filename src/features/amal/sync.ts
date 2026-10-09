"use client";

import { useEffect } from "react";
import { useAmalStore } from "@/stores/amal-store";
import { usePlanStore } from "@/stores/zikr-plan-store";
import { useStoreHydrated } from "@/hooks/use-hydrated";

/**
 * Catch up on deeds finished elsewhere: after-salah zikr plans completed (also by skipping the
 * last step) in the last week are ticked in the tracker. Runs whenever plan progress changes.
 */
export function useAmalSync() {
  const progress = usePlanStore((s) => s.progress);
  const plansReady = useStoreHydrated(usePlanStore);
  const amalReady = useStoreHydrated(useAmalStore);
  useEffect(() => {
    if (!plansReady || !amalReady) return;
    const mark = useAmalStore.getState().markAuto;
    for (const [key, pr] of Object.entries(progress)) {
      if (!pr.done) continue;
      const [planId, day] = key.split("|");
      if (planId?.startsWith("salah-") && day) mark(day, `${planId.slice(6)}-adhkar`, pr.updated || Date.now());
    }
  }, [progress, plansReady, amalReady]);
}
