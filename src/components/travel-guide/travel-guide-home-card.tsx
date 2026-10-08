"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";

const CHIPS = ["📱", "🚆", "🛂", "💰", "🩺", "🆘"];

/** Home shortcut to the practical travel guide (SIM, train, visa, money, health, emergency). */
export function TravelGuideHomeCard() {
  const { t } = useI18n();
  return (
    <Link href="/travel-guide" className="block">
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-xl" aria-hidden>
          🧭
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("travelGuide.title")}</p>
          <p className="truncate text-sm text-muted-foreground">{t("travelGuide.homeSub")}</p>
          <p className="mt-1 flex gap-1.5 text-base leading-none" aria-hidden>
            {CHIPS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
          {t("travelGuide.open")}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
