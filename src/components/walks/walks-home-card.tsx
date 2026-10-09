"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useWalksStore } from "@/stores/walks-store";

/** Home shortcut to recording and following saved walks (waypoints). */
export function WalksHomeCard() {
  const { t, formatNumber } = useI18n();
  const hydrated = useStoreHydrated(useWalksStore);
  const count = useWalksStore((s) => s.walks.length);
  const recording = useWalksStore((s) => s.current.on);
  return (
    <Link href="/walks" className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl" aria-hidden>
          👣
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("walks.homeTitle")}</p>
          <p className="truncate text-sm text-muted-foreground">
            {hydrated && recording ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-danger">
                <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden />
                {t("haramMap.trackRecording")}
              </span>
            ) : hydrated && count ? (
              `${t("walks.saved")}: ${formatNumber(count)}`
            ) : (
              t("walks.homeSub")
            )}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("walks.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
