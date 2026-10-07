"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { SectionHeader } from "@/components/ui/card";
import { usePrayerData } from "@/hooks/use-prayer";
import { AdhanGuide, AdhanWindowCard } from "./adhan-guide";
import { Card } from "@/components/ui/card";
import { DatesCard, NaflCard, NextPrayerCard, NightCard, PrayerNotices, PrayerSchedule, StaffSchedule, UpcomingStaff } from "./prayer-widgets";

export function PrayerDashboard() {
  const { t } = useI18n();
  const location = usePrefs((s) => s.location);
  const data = usePrayerData(location);
  return (
    <div className="space-y-6">
      <AdhanWindowCard data={data} />
      <NextPrayerCard data={data} strip={false} />
      <DatesCard data={data} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <section>
          <SectionHeader title={t("prayer.todaySchedule")} />
          <PrayerSchedule data={data} />
          <div className="mt-3">
            <PrayerNotices data={data} />
          </div>
          <div className="mt-6">
            <SectionHeader title={t("prayer.nightTitle")} />
            <NightCard data={data} />
          </div>
          <div className="mt-6">
            <SectionHeader title={t("prayer.naflTitle")} />
            <NaflCard data={data} />
          </div>
        </section>
        <div className="space-y-6">
          <StaffSchedule data={data} kind="imam" />
          <StaffSchedule data={data} kind="muezzin" />
          <UpcomingStaff data={data} />
        </div>
      </div>
      <section id="adhan">
        <SectionHeader title={t("adhan.sectionTitle")} />
        <p className="-mt-1 mb-3 text-sm text-muted-foreground">{t("adhan.sectionHint")}</p>
        <Card className="p-4">
          <AdhanGuide prayer={null} storageKey="practice" />
        </Card>
      </section>
    </div>
  );
}
