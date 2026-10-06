"use client";

import { motion } from "motion/react";
import { Clock3, MapPin, Moon, Sunrise, User, Mic } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Badge, Card, GlassCard, SectionHeader } from "@/components/ui/card";
import { Skeleton, UnavailableNotice } from "@/components/ui/states";
import { LOCATIONS } from "@/config/locations";
import { formatGregorian, formatHijri, formatTime } from "@/features/prayer/calendar";
import { SALAH, splitDuration, type PrayerName, type PrayerSlot } from "@/features/prayer/times";
import { usePrayerData } from "@/hooks/use-prayer";
import { cn } from "@/lib/utils";
import type { TKey } from "@/i18n";
import type { PersonName } from "@/types/haramain";

type Data = ReturnType<typeof usePrayerData>;

export function prayerLabelKey(name: PrayerName, isFriday: boolean): TKey {
  if (name === "dhuhr" && isFriday) return "prayer.jumuah";
  return `prayer.${name}`;
}

function pad2(n: number, fmt: (n: number) => string) {
  return fmt(n).padStart(2, fmt(0));
}

export function Countdown({ ms }: { ms: number }) {
  const { formatNumber } = useI18n();
  const { h, m, s } = splitDuration(ms);
  return (
    <span className="font-display tabular-nums tracking-tight" dir="ltr" aria-hidden>
      {pad2(h, formatNumber)}:{pad2(m, formatNumber)}:{pad2(s, formatNumber)}
    </span>
  );
}

/** Large "next prayer" card with live countdown and status. */
export function NextPrayerCard({ data }: { data: Data }) {
  const { t, intlLocale, locale } = useI18n();
  const location = usePrefs((s) => s.location);
  const { info, days, now } = data;

  if (!info || !days || !now) return <Skeleton className="h-48 w-full rounded-2xl" />;

  const isFriday = info.nextIsTomorrow ? days.tomorrow.isFriday : days.today.isFriday;
  const nextName = t(prayerLabelKey(info.next.name, isFriday));
  const { h, m } = splitDuration(info.msUntilNext);
  const srText = `${t("prayer.nextPrayer")}: ${nextName}, ${t("prayer.startsIn")} ${h}h ${m}m`;

  return (
    <GlassCard className="relative overflow-hidden p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -end-10 -top-10 size-44 rounded-full border border-gold/20" />
      <div aria-hidden className="pointer-events-none absolute -end-4 -top-4 size-28 rounded-full border border-gold/30" />
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4 text-gold" aria-hidden />
        {t(LOCATIONS[location].mosqueKey)}
        <span aria-hidden>·</span>
        <span>
          {t("prayer.localTime")} {formatTime(now, intlLocale, undefined, true)}
        </span>
      </div>

      {info.current ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
          role="status"
        >
          <span className="size-2 animate-pulse rounded-full bg-gold" aria-hidden />
          {info.iqamahApproaching ? t("prayer.iqamahSoon") : t("prayer.prayerNow")}: {t(prayerLabelKey(info.current.name, days.today.isFriday))}
        </motion.div>
      ) : null}

      <p className="mt-4 text-sm font-medium text-muted-foreground">{t("prayer.nextPrayer")}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-3xl font-bold text-foreground sm:text-4xl">
            {nextName}
            {info.nextIsTomorrow ? <span className="ms-2 text-base font-normal text-muted-foreground">({t("common.tomorrow")})</span> : null}
          </p>
          <p className="text-lg text-primary">{formatTime(info.next.adhan, intlLocale)}</p>
          {info.next.imam ? (
            <p dir="auto" className="mt-1 text-sm text-muted-foreground">
              {t("prayer.ledBy", { name: locale === "ar" || locale === "ur" ? info.next.imam.ar : info.next.imam.en })}
            </p>
          ) : null}
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">{t("prayer.startsIn")}</p>
          <p className="text-4xl font-semibold text-gold sm:text-5xl">
            <Countdown ms={info.msUntilNext} />
          </p>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {srText}
      </p>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  if (status === "now") return <Badge tone="primary">{t("prayer.prayerNow")}</Badge>;
  if (status === "next") return <Badge tone="gold">{t("prayer.upcoming")}</Badge>;
  if (status === "passed") return <span className="text-xs text-muted-foreground">{t("prayer.passed")}</span>;
  return null;
}

export function PrayerSchedule({ data, compact }: { data: Data; compact?: boolean }) {
  const { t, intlLocale } = useI18n();
  const { days, info } = data;
  if (!days || !info) return <Skeleton className="h-72 w-full rounded-2xl" />;
  const { today } = days;

  return (
    <Card className="overflow-hidden p-0">
      <ul>
        {today.prayers.map((p: PrayerSlot) => {
          const status = info.statuses[p.name];
          const isSunrise = p.name === "sunrise";
          return (
            <li
              key={p.name}
              aria-current={status === "next" || status === "now" ? "time" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-3 border-b border-border/70 px-4 py-3 last:border-0",
                status === "now" && "bg-primary-soft",
                status === "next" && "bg-gold-soft/50",
                status === "passed" && "opacity-70",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-gold">
                {isSunrise ? <Sunrise className="size-4" aria-hidden /> : p.name === "isha" || p.name === "maghrib" ? <Moon className="size-4" aria-hidden /> : <Clock3 className="size-4" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block font-medium", isSunrise && "text-muted-foreground")}>{t(prayerLabelKey(p.name, today.isFriday))}</span>
                {!compact && !isSunrise && p.iqamah ? (
                  <span className="block text-xs text-muted-foreground">{t("prayer.iqamah", { time: formatTime(p.iqamah, intlLocale) })}</span>
                ) : null}
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-base font-semibold tabular-nums">{formatTime(p.adhan, intlLocale)}</span>
                {!isSunrise ? <StatusBadge status={status} /> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function DatesCard({ data }: { data: Data }) {
  const { t, intlLocale } = useI18n();
  if (!data.days) return <Skeleton className="h-24 w-full rounded-2xl" />;
  const d = data.days.today.date;
  const hijri = formatHijri(d, intlLocale);
  return (
    <Card className="grid gap-3 p-4 sm:grid-cols-2">
      <div>
        <p className="text-xs text-muted-foreground">{t("prayer.gregorian")}</p>
        <p className="font-medium">{formatGregorian(d, intlLocale)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("prayer.hijri")}</p>
        <p className="font-medium text-primary">{hijri || t("prayer.notAvailable")}</p>
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">{t("prayer.hijriNote")}</p>
    </Card>
  );
}

/** Imam & Muezzin. Shows only sourced, validated names for today; otherwise an explicit "unavailable" notice. */
export function StaffSchedule({ data, kind }: { data: Data; kind: "imam" | "muezzin" }) {
  const { t, intlLocale, locale } = useI18n();
  const { schedule, days, staleSchedule } = data;
  // Names are shown exactly as the source publishes them: Arabic for Arabic/Urdu UIs, English otherwise.
  const display = (n: PersonName | null) => (n ? (locale === "ar" || locale === "ur" ? n.ar : n.en) : null);
  const title = kind === "imam" ? t("prayer.imamTitle") : t("prayer.muezzinTitle");
  const unavailableMsg = kind === "imam" ? t("prayer.imamUnavailable") : t("prayer.muezzinUnavailable");
  const Icon = kind === "imam" ? User : Mic;

  let body: React.ReactNode;
  if (schedule.isPending) body = <Skeleton className="h-24 w-full" />;
  else if (schedule.isError || !schedule.data || schedule.data.status !== "available" || !days) {
    body = (
      <div className="space-y-2">
        <UnavailableNotice message={unavailableMsg} />
        {schedule.isError ? <p className="text-xs text-muted-foreground">{t("common.liveUnavailable")}</p> : null}
      </div>
    );
  } else {
    const s = schedule.data;
    const rows = days.today.prayers.filter((p) => SALAH.includes(p.name));
    const anyName = rows.some((p) => (kind === "imam" ? p.imam : p.muezzin));
    body = anyName ? (
      <>
        <ul className="divide-y divide-border/70">
          {rows.map((p) => {
            const name = display(kind === "imam" ? p.imam : p.muezzin);
            return (
              <li key={p.name} className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="text-sm text-muted-foreground">{t(prayerLabelKey(p.name, days.today.isFriday))}</span>
                <span dir="auto" className={cn("text-end text-sm font-medium", !name && "text-muted-foreground")}>
                  {name ?? t("prayer.notAvailable")}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {s.source ? <p>{t("prayer.officialSource", { name: s.source.name })}</p> : null}
          {s.source?.scheduleDate ? <p>{t("prayer.scheduleDate", { date: s.source.scheduleDate })}</p> : null}
          <p>{t("common.updated", { time: formatTime(new Date(s.fetchedAt), intlLocale, undefined) })}</p>
          {staleSchedule ? <p className="font-medium text-warning">{t("common.stale")}</p> : null}
        </div>
      </>
    ) : (
      <UnavailableNotice message={unavailableMsg} />
    );
  }

  return (
    <section>
      <SectionHeader as="h3" title={<span className="flex items-center gap-2"><Icon className="size-4 text-gold" aria-hidden />{title}</span>} />
      <Card className="p-4">{body}</Card>
    </section>
  );
}

/** Calculation-method disclosure + edge-case notes (Friday, Ramadan, clock skew). */
export function PrayerNotices({ data }: { data: Data }) {
  const { t, formatNumber } = useI18n();
  const { days, skewMs } = data;
  return (
    <div className="space-y-2">
      {skewMs ? <UnavailableNotice message={t("prayer.clockSkew", { minutes: formatNumber(Math.round(Math.abs(skewMs) / 60000)) })} /> : null}
      {days?.today.isFriday ? <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{t("prayer.fridayNote")}</p> : null}
      {days?.today.isRamadan ? <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{t("prayer.ramadanNote")}</p> : null}
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-gold">{t("common.source")}:</span> {t("prayer.calcSource")}. {t("prayer.calculatedNote")}
      </p>
    </div>
  );
}
