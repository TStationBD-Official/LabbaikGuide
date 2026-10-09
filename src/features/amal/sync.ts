"use client";

import { useEffect } from "react";
import { useAmalStore } from "@/stores/amal-store";
import { usePlanStore } from "@/stores/zikr-plan-store";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { usePrefs } from "@/components/providers/preferences-provider";

/**
 * Catch up on deeds finished elsewhere: after-salah zikr plans completed (also by skipping the
 * last step) in the last week are ticked in the tracker. Runs whenever plan progress changes.
 */
export function useAmalSync() {
  // Keep the tracker's city (for prayer-time windows) in step with the app setting.
  const progress = usePlanStore((s) => s.progress);
  const plansReady = useStoreHydrated(usePlanStore);
  const amalReady = useStoreHydrated(useAmalStore);
  const location = usePrefs((s) => s.location);
  useEffect(() => {
    if (amalReady && useAmalStore.getState().location !== location) useAmalStore.getState().setLocation(location);
  }, [amalReady, location]);
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
