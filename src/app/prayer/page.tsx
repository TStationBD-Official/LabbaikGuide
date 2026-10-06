import { PageTitle } from "@/components/ui/page-title";
import { PrayerDashboard } from "@/components/prayer/prayer-dashboard";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/prayer", "prayer.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="prayer.title" prefix="🕌" />
      <PrayerDashboard />
    </>
  );
}
