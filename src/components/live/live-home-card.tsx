"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { LIVE_CHANNELS } from "@/data/live";
import { LiveBadge, LiveThumb } from "./live-page";
import { useLiveStreams } from "./use-live";

/** Home: the two official live broadcasts, each opening the live page on that Haram. */
export function LiveHomeCard() {
  const { t } = useI18n();
  const q = useLiveStreams();
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            {t("live.homeTitle")}
            {q.data?.channels.some((c) => c.videoId) ? <LiveBadge small /> : null}
          </p>
          <p className="truncate text-sm text-muted-foreground">{t("live.homeSub")}</p>
        </div>
        <Link href="/live" className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("live.watch")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {LIVE_CHANNELS.map((c) => {
          const id = q.data?.channels.find((x) => x.id === c.id)?.videoId;
          return (
            <Link key={c.id} href={`/live?ch=${c.id}`} className="group relative block aspect-video overflow-hidden rounded-xl bg-black">
              <LiveThumb id={id} place={c.id} />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <span className="absolute bottom-1.5 start-2 text-xs font-semibold text-white">{t(c.id === "makkah" ? "location.makkah" : "location.madinah")}</span>
              <span className="absolute end-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/90 text-red-600 shadow" aria-hidden>
                <svg viewBox="0 0 24 24" className="size-3.5 translate-x-px fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
