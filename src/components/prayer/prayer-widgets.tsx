"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Moon, Sunrise, User, Mic } from "lucide-react";
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
    <span className="font-sans font-semibold tabular-nums tracking-tight [font-feature-settings:'tnum','lnum']" dir="ltr" aria-hidden>
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
    <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
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

/** Round photo from the schedule source: proxy → original URL → initials. */
export function PersonAvatar({ person, size = "md" }: { person: PersonName; size?: "sm" | "md" }) {
  // Try our same-origin proxy first (cached offline), then the source's original URL, then initials.
  const direct = person.image ? new URLSearchParams(person.image.split("?")[1] ?? "").get("u") : null;
  const sources = [person.image, direct].filter((x): x is string => Boolean(x));
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];
  const initials = person.en
    .replace(/^((Prof|Dr)\.\s*|Sheikh\s+)+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dim = size === "sm" ? "size-9 text-[10px]" : "size-12 text-xs";
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary ring-2 ring-primary/25", dim)} aria-hidden>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny photo; next/image adds nothing here
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover object-top"
          onError={() => setAttempt((a) => a + 1)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

function useDisplayName() {
  const { locale } = useI18n();
  // Names are shown exactly as the source publishes them: Arabic for Arabic/Urdu UIs, English otherwise.
  return (n: PersonName) => (locale === "ar" || locale === "ur" ? n.ar : n.en);
}

/** Imam & Muezzin. Shows only sourced, validated names for today; otherwise an explicit "unavailable" notice. */
export function StaffSchedule({ data, kind }: { data: Data; kind: "imam" | "muezzin" }) {
  const { t, intlLocale } = useI18n();
  const display = useDisplayName();
  const { schedule, days, staleSchedule } = data;
  const title = kind === "imam" ? t("prayer.imamTitle") : t("prayer.muezzinTitle");
  const unavailableMsg = kind === "imam" ? t("prayer.imamUnavailable") : t("prayer.muezzinUnavailable");
  const Icon = kind === "imam" ? User : Mic;

  const s = schedule.data;
  const recentFor = (name: PrayerName) => s?.recent.find((r) => r.name === name)?.[kind] ?? null;
  const shortDate = (d: string) => {
    const [y, m, dd] = d.split("-").map(Number);
    return new Intl.DateTimeFormat(`${intlLocale}-u-ca-gregory`, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(
      new Date(Date.UTC(y, m - 1, dd, 12)),
    );
  };

  let body: React.ReactNode;
  const rows = days ? days.today.prayers.filter((p) => SALAH.includes(p.name)) : [];
  const todayAvailable = s?.status === "available";
  const todayPerson = (p: (typeof rows)[number]) => (todayAvailable ? (kind === "imam" ? p.imam : p.muezzin) : null);
  const anyData = rows.some((p) => todayPerson(p) || recentFor(p.name));

  if (schedule.isPending || (!days && !schedule.isError)) body = <Skeleton className="h-24 w-full" />;
  else if (schedule.isError || !s || !days || !anyData) {
    body = (
      <div className="space-y-2">
        <UnavailableNotice message={unavailableMsg} />
        {schedule.isError ? <p className="text-xs text-muted-foreground">{t("common.liveUnavailable")}</p> : null}
      </div>
    );
  } else {
    const usedRecent = rows.some((p) => !todayPerson(p) && recentFor(p.name));
    const missing = rows.some((p) => !todayPerson(p) && !recentFor(p.name));
    body = (
      <>
        <ul className="divide-y divide-border/70">
          {rows.map((p) => {
            const today = todayPerson(p);
            const recent = today ? null : recentFor(p.name);
            const person = today ?? recent?.person ?? null;
            return (
              <li key={p.name} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <span className="shrink-0 text-sm text-muted-foreground">{t(prayerLabelKey(p.name, days.today.isFriday))}</span>
                {person ? (
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="min-w-0 text-end">
                      <span dir="auto" className={cn("block text-sm font-medium", recent && "text-foreground/80")}>
                        {display(person)}
                      </span>
                      {recent ? (
                        <span className="mt-0.5 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                          {t("prayer.lastPublished", { date: shortDate(recent.date) })}
                        </span>
                      ) : null}
                    </span>
                    <PersonAvatar person={person} />
                  </span>
                ) : (
                  <span className="text-end text-xs text-muted-foreground">{t("prayer.notPublished")}</span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {usedRecent ? <p>{t("prayer.recentNote")}</p> : missing ? <p>{t("prayer.partialNote")}</p> : null}
          {s.source ? <p>{t("prayer.officialSource", { name: s.source.name })}</p> : null}
          <p>{t("common.updated", { time: formatTime(new Date(s.fetchedAt), intlLocale, undefined) })}</p>
          {staleSchedule ? <p className="font-medium text-warning">{t("common.stale")}</p> : null}
        </div>
      </>
    );
  }

  return (
    <section>
      <SectionHeader as="h3" title={<span className="flex items-center gap-2"><Icon className="size-4 text-gold" aria-hidden />{title}</span>} />
      <Card className="p-4">{body}</Card>
    </section>
  );
}

/** Coming days' Imams & Muezzins — only what the source has already published, never inferred. */
export function UpcomingStaff({ data }: { data: Data }) {
  const { t, intlLocale } = useI18n();
  const display = useDisplayName();
  const upcoming = data.schedule.data?.upcoming ?? [];
  const [sel, setSel] = useState(0);
  if (!upcoming.length) return null;
  const idx = Math.min(sel, upcoming.length - 1);
  const day = upcoming[idx];
  const ymd = (d: string) => {
    const [y, m, dd] = d.split("-").map(Number);
    return { y, m, d: dd };
  };
  const label = (d: string, short: boolean) =>
    new Intl.DateTimeFormat(`${intlLocale}-u-ca-gregory`, {
      timeZone: "UTC",
      weekday: short ? "short" : "long",
      day: "numeric",
      month: short ? "short" : "long",
    }).format(new Date(Date.UTC(ymd(d).y, ymd(d).m - 1, ymd(d).d, 12)));
  const isFriday = new Date(Date.UTC(ymd(day.date).y, ymd(day.date).m - 1, ymd(day.date).d, 12)).getUTCDay() === 5;
  const rows = day.prayers.filter((p) => SALAH.includes(p.name));

  return (
    <section className="min-w-0">
      <SectionHeader as="h3" title={<span className="flex items-center gap-2"><CalendarDays className="size-4 text-gold" aria-hidden />{t("prayer.upcomingTitle")}</span>} />
      <Card className="p-4">
        <div role="tablist" aria-label={t("prayer.upcomingTitle")} className="-mx-1 mb-3 flex w-[calc(100%+0.5rem)] min-w-0 gap-2 overflow-x-auto px-1 pb-1 [contain:inline-size]">
          {upcoming.map((d, i) => (
            <button
              key={d.date}
              type="button"
              role="tab"
              aria-selected={i === idx}
              onClick={() => setSel(i)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                i === idx ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
              )}
            >
              {i === 0 && d.date === nextDayKey(data.schedule.data!.date) ? t("prayer.tomorrow") : label(d.date, true)}
            </button>
          ))}
        </div>
        <p className="mb-2 text-sm font-medium">{label(day.date, false)}</p>
        <ul role="tabpanel" className="divide-y divide-border/70">
          {rows.map((p) => (
            <li key={p.name} className="py-2.5">
              <p className="mb-1.5 text-sm font-semibold text-primary">{t(prayerLabelKey(p.name, isFriday))}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["imam", "muezzin"] as const).map((k) => {
                  const person = p[k];
                  return (
                    <div key={k} className="flex min-w-0 items-center gap-2.5">
                      {person ? <PersonAvatar person={person} size="sm" /> : <span className="size-8 shrink-0 rounded-full border border-dashed border-border" aria-hidden />}
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{k === "imam" ? t("prayer.imamLabel") : t("prayer.muezzinLabel")}</p>
                        <p dir="auto" className={cn("truncate text-sm", person ? "font-medium" : "text-xs text-muted-foreground")}>
                          {person ? display(person) : t("prayer.notPublished")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t("prayer.upcomingNote")}</p>
      </Card>
    </section>
  );
}

function nextDayKey(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd + 1)).toISOString().slice(0, 10);
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
