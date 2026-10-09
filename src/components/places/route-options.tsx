"use client";

import { Footprints, Route as RouteIcon } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { walkingMinutes } from "@/features/places/geo";
import { stepsFor } from "@/features/places/track";
import type { WalkPath } from "@/hooks/use-walking-route";
import { cn } from "@/lib/utils";

const letter = (i: number) => String.fromCharCode(65 + i);

/**
 * The walking paths the router found to a destination (best first), each with distance,
 * time at a crowd pace and estimated steps. Tapping one (here or on the map) makes it the path to follow.
 */
export function RouteOptions({
  routes,
  choice,
  onChoose,
  fmtDist,
}: {
  routes: WalkPath[];
  choice: number;
  onChoose: (i: number) => void;
  fmtDist: (m: number) => string;
}) {
  const { t, formatNumber } = useI18n();
  if (!routes.length) return null;
  const best = walkingMinutes(routes[0].distance);
  return (
    <section className="space-y-2" aria-label={t("walk.paths")}>
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <RouteIcon className="size-4 text-primary" aria-hidden />
        {routes.length > 1 ? t("walk.pathsN", { n: formatNumber(routes.length) }) : t("walk.onePath")}
      </p>
      <ul role="radiogroup" aria-label={t("walk.paths")} className="space-y-2">
        {routes.map((r, i) => {
          const on = i === choice;
          const min = walkingMinutes(r.distance);
          const extra = min - best;
          return (
            <li key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChoose(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors",
                  on ? "border-primary bg-primary-soft/70" : "border-border bg-card hover:border-gold",
                )}
              >
                <span
                  className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", on ? "bg-[#2f7cf6] text-white" : "bg-muted text-muted-foreground")}
                  aria-hidden
                >
                  {letter(i)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">≈ {t("walk.minutes", { n: formatNumber(min) })}</span>
                    <span className="text-sm text-muted-foreground">{fmtDist(r.distance)}</span>
                    {i === 0 && routes.length > 1 ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{t("walk.best")}</span> : null}
                    {i > 0 && extra > 0 ? <span className="text-xs text-warning">+{t("walk.minutes", { n: formatNumber(extra) })}</span> : null}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Footprints className="size-3.5" aria-hidden />≈ {t("walk.steps", { n: formatNumber(stepsFor(r.distance)) })}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{routes.length > 1 ? t("walk.noteMany") : t("walk.noteOne")}</p>
    </section>
  );
}
