"use client";

import { motion } from "motion/react";
import Link from "next/link";
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
import type { HaramainSchedule, PersonName } from "@/types/haramain";
import { useClockStore } from "@/stores/clock-store";
import { findZone, zoneLabel } from "@/features/clock/timezones";

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

/** "4:57" without AM/PM — for the compact five-prayer strip. */
function shortTime(d: Date, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, { timeZone: "Asia/Riyadh", hour: "numeric", minute: "2-digit", hourCycle: "h12" })
    .formatToParts(d)
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
}

/** Subtle eight-point-star lattice (Islamic geometric motif) used as a texture. */
function GeometricPattern({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} width="100%" height="100%">
      <defs>
        <pattern id="hc-star" width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M28 6 34 22 50 28 34 34 28 50 22 34 6 28 22 22Z" />
            <path d="M12.4 12.4 28 18.8 43.6 12.4 37.2 28 43.6 43.6 28 37.2 12.4 43.6 18.8 28Z" />
            <circle cx="28" cy="28" r="4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hc-star)" />
    </svg>
  );
}

/** Ring that fills from the previous prayer to the next, with the live countdown inside. */
function CountdownRing({ progress, ms, label }: { progress: number; ms: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative grid size-[clamp(6.75rem,34vw,10rem)] shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className="text-[clamp(1rem,5.4vw,1.6rem)] text-gold">
          <Countdown ms={ms} />
        </span>
        <span className="mt-1.5 text-[11px] font-medium tracking-wide opacity-75">{label}</span>
      </div>
    </div>
  );
}

/** Large "next prayer" card with live countdown, progress ring and today's prayers. */
export function NextPrayerCard({ data, strip = true, stripClassName }: { data: Data; strip?: boolean; stripClassName?: string }) {
  const { t, intlLocale } = useI18n();
  const location = usePrefs((s) => s.location);
  const showHome = useClockStore((s) => s.showHome);
  const homeTz = useClockStore((s) => s.homeTz);
  const { info, days, now } = data;

  if (!info || !days || !now) return <Skeleton className="h-64 w-full rounded-3xl" />;

  const isFriday = info.nextIsTomorrow ? days.tomorrow.isFriday : days.today.isFriday;
  const nextName = t(prayerLabelKey(info.next.name, isFriday));
  const { h, m } = splitDuration(info.msUntilNext);
  const srText = `${t("prayer.nextPrayer")}: ${nextName}, ${t("prayer.startsIn")} ${h}h ${m}m`;

  // Progress through the current interval (previous prayer → next prayer).
  const salahToday = days.today.prayers.filter((p) => SALAH.includes(p.name));
  const nowMs = now.getTime();
  const prevAdhan = info.nextIsTomorrow
    ? salahToday[salahToday.length - 1].adhan.getTime()
    : ([...salahToday].reverse().find((p) => p.adhan.getTime() <= nowMs)?.adhan.getTime() ??
      salahToday[salahToday.length - 1].adhan.getTime() - 86_400_000); // before Fajr: since last night's Isha
  const span = info.next.adhan.getTime() - prevAdhan;
  const progress = span > 0 ? (nowMs - prevAdhan) / span : 0;

  const stripDay = info.nextIsTomorrow ? days.tomorrow : days.today;
  const stripPrayers = stripDay.prayers.filter((p) => SALAH.includes(p.name));

  return (
    <section
      aria-label={t("prayer.nextPrayer")}
      className="relative isolate overflow-hidden rounded-3xl text-white shadow-soft ring-1 ring-black/10"
      // Always a deep shade of the accent colour (light and dark themes alike) so white text and gold stay crisp.
      style={{
        background:
          "linear-gradient(145deg, color-mix(in oklab, var(--primary) 42%, #03110c) 0%, color-mix(in oklab, var(--primary) 62%, #03110c) 55%, color-mix(in oklab, var(--primary) 52%, #1d1504) 100%)",
      }}
    >
      <GeometricPattern className="pointer-events-none absolute inset-0 -z-10 text-white opacity-[0.07]" />
      <div aria-hidden className="pointer-events-none absolute -end-16 -top-20 -z-10 size-64 rounded-full bg-gold/20 blur-3xl" />

      <div className="p-5 sm:p-6">
        {/* Top bar: place · live local time */}
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium backdrop-blur-sm">
            <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden />
            <span className="truncate">{t(LOCATIONS[location].mosqueKey)}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 opacity-85">
            <Clock3 className="size-3.5" aria-hidden />
            <span className="tabular-nums" dir="ltr">
              {formatTime(now, intlLocale, undefined, true)}
            </span>
          </span>
        </div>

        {info.current ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-[#1c1405] sm:text-sm"
            role="status"
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-current" />
            </span>
            {info.iqamahApproaching ? t("prayer.iqamahSoon") : t("prayer.prayerNow")}: {t(prayerLabelKey(info.current.name, days.today.isFriday))}
          </motion.p>
        ) : null}

        {/* Main: next prayer + countdown ring */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide uppercase opacity-75 sm:text-sm">{t("prayer.nextPrayer")}</p>
            <p className="mt-1 text-[clamp(1.75rem,9vw,3rem)] leading-tight font-bold break-words">{nextName}</p>
            {info.nextIsTomorrow ? <p className="text-sm opacity-75">{t("common.tomorrow")}</p> : null}
            <p className="mt-2 inline-flex items-baseline gap-2">
              <span className="text-xs opacity-75">{t("prayer.adhan")}</span>
              <span className="text-[clamp(1.05rem,5vw,1.5rem)] font-semibold tabular-nums">{formatTime(info.next.adhan, intlLocale)}</span>
            </p>
            {showHome && homeTz && homeTz !== "Asia/Riyadh" ? (
              <p className="mt-0.5 truncate text-xs opacity-75">
                {findZone(homeTz)?.flag ?? "🌐"}{" "}
                {t("clock.adhanAtHome", { place: zoneLabel(findZone(homeTz), homeTz, intlLocale), time: formatTime(info.next.adhan, intlLocale, homeTz) })}
              </p>
            ) : null}
          </div>
          <CountdownRing progress={progress} ms={info.msUntilNext} label={t("prayer.remaining")} />
        </div>
      </div>

      {/* Today's five prayers */}
      {strip ? (
        <ol className={cn("grid grid-cols-5 border-t border-white/10 bg-black/15 px-2 py-3 backdrop-blur-sm", stripClassName)}>
          {stripPrayers.map((p) => {
            const isNext = p.name === info.next.name;
            const passed = !info.nextIsTomorrow && info.statuses[p.name] === "passed" && info.current?.name !== p.name;
            const isNow = info.current?.name === p.name;
            return (
              <li
                key={p.name}
                aria-current={isNext ? "time" : undefined}
                className={cn(
                  "mx-0.5 flex flex-col items-center rounded-xl px-1 py-1.5 text-center transition-colors",
                  isNext && "bg-gold text-[#1c1405] shadow-soft",
                  isNow && !isNext && "bg-white/15",
                  passed && "opacity-55",
                )}
              >
                <span className="w-full truncate text-[clamp(0.62rem,2.9vw,0.75rem)] font-medium">{t(prayerLabelKey(p.name, stripDay.isFriday))}</span>
                <span className="mt-0.5 text-[clamp(0.8rem,3.8vw,1rem)] font-semibold tabular-nums">{shortTime(p.adhan, intlLocale)}</span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {srText}
      </p>
    </section>
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

function shortYmd(d: string, intlLocale: string) {
  const [y, m, dd] = d.split("-").map(Number);
  return new Intl.DateTimeFormat(`${intlLocale}-u-ca-gregory`, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(
    new Date(Date.UTC(y, m - 1, dd, 12)),
  );
}

/** Marks a name that comes from another day's published schedule. */
function DatedTag({ date, relativeTo }: { date: string; relativeTo: string }) {
  const { t, intlLocale } = useI18n();
  const key = date > relativeTo ? "prayer.nextPublished" : "prayer.lastPublished";
  return (
    <span className="mt-0.5 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
      {t(key, { date: shortYmd(date, intlLocale) })}
    </span>
  );
}

type StaffPick = { person: PersonName; date: string | null } | null;
/**
 * Imam/Muezzin for one prayer on `dateKey`: that day's published name when present,
 * otherwise (today only) the nearest other published day, carrying its date.
 */
function pickStaff(s: HaramainSchedule | undefined, name: PrayerName, dateKey: string, kind: "imam" | "muezzin"): StaffPick {
  if (!s) return null;
  if (dateKey === s.date) {
    const p = s.status === "available" ? s.prayers.find((x) => x.name === name)?.[kind] : null;
    if (p) return { person: p, date: null };
    const r = s.recent.find((x) => x.name === name)?.[kind];
    return r ? { person: r.person, date: r.date } : null;
  }
  const row = s.upcoming.find((d) => d.date === dateKey)?.prayers.find((x) => x.name === name);
  const p = row?.[kind];
  return p ? { person: p, date: (kind === "imam" ? row.imamFrom : row.muezzinFrom) ?? null } : null;
}

/** Home: who leads / calls the next prayer, with photos. */
export function NextPrayerStaffCard({ data }: { data: Data }) {
  const { t } = useI18n();
  const display = useDisplayName();
  const { info, days, schedule } = data;
  const s = schedule.data;
  if (!info || !days || !s) return null;
  const isFriday = info.nextIsTomorrow ? days.tomorrow.isFriday : days.today.isFriday;
  const dateKey = info.nextIsTomorrow ? nextDayKey(s.date) : s.date;
  const picks = (["imam", "muezzin"] as const).map((k) => [k, pickStaff(s, info.next.name, dateKey, k)] as const);
  if (!picks.some(([, p]) => p)) return null;
  const prayer = t(prayerLabelKey(info.next.name, isFriday));
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("home.staffTitle", { prayer })}</h2>
        <Link href="/prayer" className="shrink-0 text-xs font-medium text-primary hover:underline">
          {t("common.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {picks.map(([k, pick]) => (
          <div key={k} className="flex min-w-0 items-center gap-3">
            {pick ? <PersonAvatar person={pick.person} /> : <span className="size-12 shrink-0 rounded-full border border-dashed border-border" aria-hidden />}
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{k === "imam" ? t("prayer.imamLabel") : t("prayer.muezzinLabel")}</p>
              <p dir="auto" className={cn("text-sm", pick ? "font-medium" : "text-xs text-muted-foreground")}>
                {pick ? display(pick.person) : t("prayer.notPublished")}
              </p>
              {pick?.date ? <DatedTag date={pick.date} relativeTo={dateKey} /> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
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
                      {recent ? <DatedTag date={recent.date} relativeTo={s.date} /> : null}
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
                  const from = k === "imam" ? p.imamFrom : p.muezzinFrom;
                  return (
                    <div key={k} className="flex min-w-0 items-center gap-2.5">
                      {person ? <PersonAvatar person={person} size="sm" /> : <span className="size-8 shrink-0 rounded-full border border-dashed border-border" aria-hidden />}
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{k === "imam" ? t("prayer.imamLabel") : t("prayer.muezzinLabel")}</p>
                        <p dir="auto" className={cn("text-sm", person ? "font-medium" : "text-xs text-muted-foreground")}>
                          {person ? display(person) : t("prayer.notPublished")}
                        </p>
                        {person && from ? <DatedTag date={from} relativeTo={day.date} /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {rows.some((p) => p.imamFrom || p.muezzinFrom) ? `${t("prayer.upcomingFillNote")} ` : ""}
          {t("prayer.upcomingNote")}
        </p>
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
