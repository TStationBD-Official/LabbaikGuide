"use client";

import { useMemo, useState } from "react";
import { Clock4, Settings2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Card } from "@/components/ui/card";
import { Button, IconButton } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { LOCATIONS } from "@/config/locations";
import { formatTime } from "@/features/prayer/calendar";
import { diffFromMakkah, findZone, HOME_ZONES, zoneLabel } from "@/features/clock/timezones";
import { useClock } from "@/hooks/use-prayer";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useClockStore } from "@/stores/clock-store";

/** "+3 h", "−2 h 30 m" etc., localised. */
export function useDiffLabel() {
  const { t, formatNumber } = useI18n();
  return (min: number) => {
    if (min === 0) return t("clock.same");
    const h = Math.floor(Math.abs(min) / 60);
    const m = Math.abs(min) % 60;
    const amount = m ? t("clock.hm", { h: formatNumber(h), m: formatNumber(m) }) : t("clock.h", { h: formatNumber(h) });
    return min > 0 ? t("clock.ahead", { d: amount }) : t("clock.behind", { d: amount });
  };
}

function dayLabel(d: Date, tz: string, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(d);
}

/** Makkah/Madinah time next to the user's home-country time. */
export function DualClock() {
  const { t, intlLocale } = useI18n();
  const hydrated = useStoreHydrated(useClockStore);
  const showHome = useClockStore((s) => s.showHome);
  const homeTz = useClockStore((s) => s.homeTz);
  const location = usePrefs((s) => s.location);
  const { now } = useClock(1000);
  const [editing, setEditing] = useState(false);
  const diffLabel = useDiffLabel();

  if (!hydrated || !showHome || !now) return null;
  const sheet = editing ? (
    <Sheet open onClose={() => setEditing(false)} title={t("clock.title")}>
      <HomeClockSettings onChosen={() => setEditing(false)} />
    </Sheet>
  ) : null;

  if (!homeTz) {
    return (
      <>
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Clock4 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("clock.promptTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("clock.promptBody", { time: formatTime(now, intlLocale, "Asia/Riyadh") })}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" onClick={() => setEditing(true)}>
              {t("clock.promptSet")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => useClockStore.getState().setShowHome(false)}>
              {t("clock.promptDismiss")}
            </Button>
          </div>
        </Card>
        {sheet}
      </>
    );
  }
  const zone = findZone(homeTz);
  const diff = diffFromMakkah(homeTz, now);
  const sameDay = dayLabel(now, homeTz, intlLocale) === dayLabel(now, "Asia/Riyadh", intlLocale);

  const cell = (flag: string, place: string, tz: string, sub: string) => (
    <div className="min-w-0 px-4 py-3">
      <p className="flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
        <span aria-hidden>{flag}</span>
        <span className="truncate">{place}</span>
      </p>
      <p className="mt-0.5 text-[clamp(1.35rem,6.5vw,1.9rem)] leading-tight font-semibold tabular-nums [font-feature-settings:'tnum','lnum']" dir="ltr" style={{ textAlign: "start" }}>
        {formatTime(now, intlLocale, tz)}
      </p>
      <p className="truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );

  return (
    <>
      <Card className="relative overflow-hidden p-0">
        <div className="grid grid-cols-2 divide-x divide-border/70 rtl:divide-x-reverse">
          {cell(LOCATIONS[location].icon, t(LOCATIONS[location].nameKey), "Asia/Riyadh", dayLabel(now, "Asia/Riyadh", intlLocale))}
          {cell(zone?.flag ?? "🌐", zoneLabel(zone, homeTz, intlLocale), homeTz, sameDay ? diffLabel(diff) : `${dayLabel(now, homeTz, intlLocale)} · ${diffLabel(diff)}`)}
        </div>
        <IconButton size="sm" label={t("clock.change")} className="absolute end-1 top-1 opacity-70 hover:opacity-100" onClick={() => setEditing(true)}>
          <Settings2 className="size-4" aria-hidden />
        </IconButton>
      </Card>
      {sheet}
    </>
  );
}

/** Shared by the home sheet and the Settings page. */
export function HomeClockSettings({ onChosen }: { onChosen?: () => void }) {
  const { t, intlLocale } = useI18n();
  const showHome = useClockStore((s) => s.showHome);
  const homeTz = useClockStore((s) => s.homeTz);
  const setShowHome = useClockStore((s) => s.setShowHome);
  const setHomeTz = useClockStore((s) => s.setHomeTz);
  const diffLabel = useDiffLabel();
  const options = useMemo(() => {
    const now = new Date();
    const device = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
    const list = HOME_ZONES.map((z) => ({ value: z.tz, label: `${z.flag} ${zoneLabel(z, z.tz, intlLocale)} (${diffLabel(diffFromMakkah(z.tz, now))})` }));
    if (device && !HOME_ZONES.some((z) => z.tz === device) && device !== "Asia/Riyadh")
      list.unshift({ value: device, label: `📱 ${t("clock.device")} — ${zoneLabel(null, device, intlLocale)} (${diffLabel(diffFromMakkah(device, now))})` });
    if (homeTz && !list.some((o) => o.value === homeTz)) list.unshift({ value: homeTz, label: zoneLabel(null, homeTz, intlLocale) });
    if (!homeTz) list.unshift({ value: "", label: t("clock.placeholder") });
    return list;
  }, [intlLocale, t, diffLabel, homeTz]);

  return (
    <div className="space-y-3">
      <Toggle emoji="🕰️" checked={showHome} onChange={setShowHome} label={t("clock.show")} description={t("clock.showDesc")} />
      <Select
        label={t("clock.choose")}
        value={homeTz ?? ""}
        onChange={(v) => {
          if (!v) return;
          setHomeTz(String(v));
          setShowHome(true);
          onChosen?.();
        }}
        options={options}
      />
      {!homeTz ? <p className="text-xs text-muted-foreground">{t("clock.notSet")}</p> : null}
    </div>
  );
}
