"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { gt } from "@/data/guides/travel";
import { LIVE_CHANNELS } from "@/data/live";
import { LiveBadge, Player } from "./live-page";
import { useLiveStreams } from "./use-live";

/**
 * Home: the live broadcast of the city chosen in the Makkah/Madinah tab at the top.
 * Nothing plays until it's tapped; it then starts muted and the player's speaker button turns the sound on.
 */
export function LiveHomeCard() {
  const { t, locale } = useI18n();
  const location = usePrefs((s) => s.location);
  const q = useLiveStreams();
  const channel = LIVE_CHANNELS.find((c) => c.id === location)!;
  const info = q.data?.channels.find((c) => c.id === location);
  return (
    <Card className="space-y-3 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            {gt(channel.place, locale)}
            {info?.videoId ? <LiveBadge small /> : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {gt(channel.channel, locale)} · {t("live.mutedHint")}
          </p>
        </div>
        <Link href={`/live?ch=${location}`} className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("live.watch")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
      <Player key={location} channel={channel} info={info} loading={q.isLoading} compact />
    </Card>
  );
}
