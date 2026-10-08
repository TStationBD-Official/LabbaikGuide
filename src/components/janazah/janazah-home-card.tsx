"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";

/** Home shortcut to the animated funeral-prayer tutorial (a janazah follows most prayers in the Haramain). */
export function JanazahHomeCard() {
  const { t } = useI18n();
  return (
    <Link href="/janazah" className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-xl" aria-hidden>
          🤲
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("janazah.title")}</p>
          <p className="truncate text-sm text-muted-foreground">{t("janazah.homeSub")}</p>
          <p className="mt-1 flex gap-1 text-xs font-semibold text-gold" aria-hidden>
            {["1", "2", "3", "4"].map((n) => (
              <span key={n} className="grid size-5 place-items-center rounded-full border border-gold/50">
                {n}
              </span>
            ))}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("janazah.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
