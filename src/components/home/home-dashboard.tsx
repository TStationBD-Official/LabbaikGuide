"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { BookOpen, BookText, Clock, Compass, HandHeart, Landmark, Mountain, Repeat, type LucideIcon } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card, SectionHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { NextPrayerCard, NextPrayerStaffCard, PrayerSchedule } from "@/components/prayer/prayer-widgets";
import { ContinueReadingCard } from "@/components/quran/quran-home";
import { HotelHomeCard } from "@/components/places/hotel-home-card";
import { HaramMapHomeCard } from "@/components/haram-map/haram-map-home-card";
import { WalksHomeCard } from "@/components/walks/walks-home-card";
import { TravelGuideHomeCard } from "@/components/travel-guide/travel-guide-home-card";
import { JanazahHomeCard } from "@/components/janazah/janazah-home-card";
import { DualClock } from "@/components/home/dual-clock";
import { AdhanWindowCard } from "@/components/prayer/adhan-guide";
import { DuaCard } from "@/components/dua/dua-card";
import { LOCATIONS } from "@/config/locations";
import { DUAS } from "@/data/dua/duas";
import { UMRAH_STEPS } from "@/data/guides/umrah";
import { computeStats } from "@/features/zikr/logic";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { usePrayerData } from "@/hooks/use-prayer";
import { useRitualsStore } from "@/stores/rituals-store";
import { useZikrStore } from "@/stores/zikr-store";
import { lt } from "@/types/content";
import type { TKey } from "@/i18n";

const QUICK: { href: string; icon: LucideIcon; label: TKey }[] = [
  { href: "/quran", icon: BookOpen, label: "nav.quran" },
  { href: "/zikr", icon: Repeat, label: "nav.zikr" },
  { href: "/duas", icon: HandHeart, label: "nav.duas" },
  { href: "/umrah", icon: Landmark, label: "nav.umrah" },
  { href: "/hajj", icon: Mountain, label: "nav.hajj" },
  { href: "/prayer", icon: Clock, label: "nav.prayer" },
  { href: "/qibla", icon: Compass, label: "nav.qibla" },
  { href: "/manasik", icon: BookText, label: "nav.guides" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function ZikrShortcut() {
  const { t } = useI18n();
  const hydrated = useStoreHydrated(useZikrStore);
  const history = useZikrStore((s) => s.history);
  const today = useMemo(() => computeStats(history, new Date()).today, [history]);
  return (
    <Link href="/zikr" className="block h-full">
      <Card className="flex h-full items-center gap-4 p-4 transition-colors hover:border-gold">
        <span className="grid size-12 place-items-center rounded-2xl bg-gold-soft text-gold">
          <Repeat className="size-6" aria-hidden />
        </span>
        <span>
          <span className="block text-sm text-muted-foreground">{t("home.zikrToday")}</span>
          {hydrated ? <AnimatedNumber value={today} className="text-2xl font-semibold" /> : <span className="text-2xl">—</span>}
        </span>
      </Card>
    </Link>
  );
}

function UmrahProgressCard() {
  const { t, contentLocale } = useI18n();
  const hydrated = useStoreHydrated(useRitualsStore);
  const done = useRitualsStore((s) => s.umrahDone);
  const count = UMRAH_STEPS.filter((s) => done[s.id]).length;
  const next = UMRAH_STEPS.find((s) => !done[s.id]);
  return (
    <Link href={next ? `/umrah#step-${next.id}` : "/umrah"} className="block h-full">
      <Card className="h-full p-4 transition-colors hover:border-gold">
        <p className="text-sm text-muted-foreground">{t("home.umrahProgress")}</p>
        {hydrated ? (
          <>
            <p className="mt-1 font-semibold">
              {count === 0 ? t("home.umrahNotStarted") : next ? t("home.nextStep", { step: lt(next.title, contentLocale) }) : t("manasik.completedAll")}
            </p>
            <Progress className="mt-3" value={count} max={UMRAH_STEPS.length} label={t("home.umrahProgress")} />
          </>
        ) : (
          <div className="skeleton mt-2 h-8 rounded-lg" />
        )}
      </Card>
    </Link>
  );
}

export function HomeDashboard() {
  const { t } = useI18n();
  const location = usePrefs((s) => s.location);
  const data = usePrayerData(location);
  // A different dua each day (Riyadh calendar), stable for the whole day.
  const date = data.days?.today.date;
  const dua = useMemo(() => {
    if (!date) return DUAS[0];
    const dayNumber = Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
    return DUAS[dayNumber % DUAS.length];
  }, [date]);

  return (
    <div className="space-y-8">
      <section className="text-center sm:text-start">
        <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose text-primary sm:text-3xl">
          السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {LOCATIONS[location].icon} {t(LOCATIONS[location].nameKey)} · {t(LOCATIONS[location].mosqueKey)}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <AdhanWindowCard data={data} />
          <NextPrayerCard data={data} stripClassName="lg:hidden" />
          <DualClock />
          <NextPrayerStaffCard data={data} />
          <HaramMapHomeCard />
          <WalksHomeCard />
          <TravelGuideHomeCard />
          <JanazahHomeCard />
          <HotelHomeCard />
        </div>
        {/* Wide screens: schedule (and on xl the dua of the day) stay in view beside the main column. */}
        <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block">
          <PrayerSchedule data={data} compact />
          <section className="hidden xl:block">
            <SectionHeader title={t("home.quickDua")} action={<Link href="/duas" className="text-sm text-primary">{t("common.viewAll")}</Link>} />
            <DuaCard dua={dua} />
          </section>
        </aside>
      </div>

      <section>
        <SectionHeader title={t("home.quickActions")} />
        <motion.ul variants={container} initial="hidden" animate="show" className="grid auto-rows-fr grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
          {QUICK.map((q) => (
            <motion.li key={q.href} variants={item} className="h-full">
              <Link
                href={q.href}
                className="flex h-full min-h-20 flex-col items-center justify-start gap-1.5 rounded-2xl border border-border bg-card/80 p-2 text-center text-xs font-medium shadow-soft transition-colors hover:border-gold sm:text-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <q.icon className="size-5" aria-hidden />
                </span>
                <span className="line-clamp-2 min-h-[2lh] leading-tight">{t(q.label)}</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <ContinueReadingCard compact />
        </div>
        <ZikrShortcut />
        <UmrahProgressCard />
      </div>

      <section className="lg:hidden">
        <SectionHeader title={t("prayer.todaySchedule")} action={<Link href="/prayer" className="text-sm text-primary">{t("common.viewAll")}</Link>} />
        <PrayerSchedule data={data} compact />
      </section>

      <section className="xl:hidden">
        <SectionHeader title={t("home.quickDua")} action={<Link href="/duas" className="text-sm text-primary">{t("common.viewAll")}</Link>} />
        <DuaCard dua={dua} />
      </section>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-gold">{t("common.source")}:</span> {t("prayer.calcSource")} ·{" "}
        <Link href="/sources" className="text-primary underline-offset-2 hover:underline">
          {t("nav.sources")}
        </Link>
      </p>
    </div>
  );
}
