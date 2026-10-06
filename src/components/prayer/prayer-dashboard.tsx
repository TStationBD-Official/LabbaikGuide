"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { SectionHeader } from "@/components/ui/card";
import { usePrayerData } from "@/hooks/use-prayer";
import { DatesCard, NextPrayerCard, PrayerNotices, PrayerSchedule, StaffSchedule } from "./prayer-widgets";

export function PrayerDashboard() {
  const { t } = useI18n();
  const location = usePrefs((s) => s.location);
  const data = usePrayerData(location);
  return (
    <div className="space-y-6">
      <NextPrayerCard data={data} />
      <DatesCard data={data} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader title={t("prayer.todaySchedule")} />
          <PrayerSchedule data={data} />
          <div className="mt-3">
            <PrayerNotices data={data} />
          </div>
        </section>
        <div className="space-y-6">
          <StaffSchedule data={data} kind="imam" />
          <StaffSchedule data={data} kind="muezzin" />
        </div>
      </div>
    </div>
  );
}
