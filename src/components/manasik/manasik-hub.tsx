"use client";

import Link from "next/link";
import { CircleDot, Footprints, HeartHandshake, Landmark, Mountain, type LucideIcon } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/ui/card";
import { UMRAH_STEPS } from "@/data/guides/umrah";
import { RITUAL_TOTAL } from "@/features/manasik/counter";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useRitualsStore } from "@/stores/rituals-store";
import type { TKey } from "@/i18n";

function HubCard({
  href,
  icon: Icon,
  title,
  desc,
  progress,
}: {
  href: string;
  icon: LucideIcon;
  title: TKey;
  desc: TKey;
  progress?: { value: number; max: number };
}) {
  const { t } = useI18n();
  return (
    <Link href={href} className="group block">
      <GlassCard className="h-full p-5 transition-colors group-hover:border-gold">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Icon className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">{t(title)}</span>
            <span className="block text-sm text-muted-foreground">{t(desc)}</span>
          </span>
        </div>
        {progress ? <Progress className="mt-4" value={progress.value} max={progress.max} label={t(title)} /> : null}
      </GlassCard>
    </Link>
  );
}

export function ManasikHub() {
  const hydrated = useStoreHydrated(useRitualsStore);
  const s = useRitualsStore();
  const umrahDone = UMRAH_STEPS.filter((x) => s.umrahDone[x.id]).length;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <HubCard
        href="/umrah"
        icon={Landmark}
        title="manasik.umrahGuide"
        desc="manasik.umrahDesc"
        progress={hydrated ? { value: umrahDone, max: UMRAH_STEPS.length } : undefined}
      />
      <HubCard href="/hajj" icon={Mountain} title="manasik.hajjGuide" desc="manasik.hajjDesc" />
      <HubCard
        href="/tawaf"
        icon={CircleDot}
        title="tawaf.title"
        desc="manasik.tawafDesc"
        progress={hydrated ? { value: s.tawaf.completed, max: RITUAL_TOTAL } : undefined}
      />
      <HubCard
        href="/sai"
        icon={Footprints}
        title="sai.title"
        desc="manasik.saiDesc"
        progress={hydrated ? { value: s.sai.completed, max: RITUAL_TOTAL } : undefined}
      />
      <HubCard href="/janazah" icon={HeartHandshake} title="janazah.title" desc="janazah.homeSub" />
    </div>
  );
}
