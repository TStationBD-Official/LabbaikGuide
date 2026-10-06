import { PageHeader } from "@/components/ui/card";
import { PrayerDashboard } from "@/components/prayer/prayer-dashboard";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/prayer", "prayer.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={`🕌 ${t("prayer.title")}`} />
      <PrayerDashboard />
    </>
  );
}
