"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { EmptyState, SkeletonList } from "@/components/ui/states";
import { DUAS } from "@/data/dua/duas";
import { useStoreHydrated } from "@/hooks/use-hydrated";
import { useFavoritesStore } from "@/stores/favorites-store";
import type { DuaCategory } from "@/types/content";
import { cn } from "@/lib/utils";
import { DuaCard } from "./dua-card";

const CATEGORIES: DuaCategory[] = [
  "umrah",
  "hajj",
  "tawaf",
  "sai",
  "arafah",
  "muzdalifah",
  "mina",
  "travel",
  "masjid",
  "forgiveness",
  "parents",
  "family",
  "rizq",
  "health",
  "protection",
  "jannah",
  "quranic",
];

type Filter = "all" | "favorites" | DuaCategory;

export function DuaLibrary({ initial = "all" }: { initial?: Filter }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>(initial);
  const hydrated = useStoreHydrated(useFavoritesStore);
  const favorites = useFavoritesStore((s) => s.duas);

  const list = useMemo(() => {
    if (filter === "all") return DUAS;
    if (filter === "favorites") return favorites.map((id) => DUAS.find((d) => d.id === id)).filter((d) => d !== undefined);
    return DUAS.filter((d) => d.categories.includes(filter));
  }, [filter, favorites]);

  const chip = (value: Filter, label: string, icon?: React.ReactNode) => (
    <button
      key={value}
      type="button"
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
      className={cn(
        "flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
        filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div role="group" aria-label={t("dua.title")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
        {chip("all", t("dua.all"))}
        {chip("favorites", t("dua.favorites"), <Heart className="size-4" aria-hidden />)}
        {CATEGORIES.map((c) => chip(c, t(`dua.category.${c}`)))}
      </div>
      {filter === "favorites" && !hydrated ? (
        <SkeletonList rows={2} />
      ) : list.length === 0 ? (
        <EmptyState message={filter === "favorites" ? t("dua.noFavorites") : t("common.noResults")} icon={<Heart className="size-8 text-muted-foreground" aria-hidden />} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((d) => (
            <DuaCard key={d.id} dua={d} anchor />
          ))}
        </div>
      )}
    </div>
  );
}
