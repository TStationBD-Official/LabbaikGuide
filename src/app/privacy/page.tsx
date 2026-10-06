import { InfoPage } from "@/components/common/info-page";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/privacy", "privacy.title", "privacy.intro");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <InfoPage
      title={t("privacy.title")}
      intro={t("privacy.intro")}
      sections={[
        { title: t("privacy.localTitle"), body: t("privacy.localBody") },
        { title: t("privacy.locationTitle"), body: t("privacy.locationBody") },
        { title: t("privacy.networkTitle"), body: t("privacy.networkBody") },
        { title: t("privacy.analyticsTitle"), body: t("privacy.analyticsBody") },
        { title: t("privacy.notifTitle"), body: t("privacy.notifBody") },
      ]}
    />
  );
}
