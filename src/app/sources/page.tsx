import { InfoPage } from "@/components/common/info-page";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/sources", "sources.title", "sources.intro");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <InfoPage
      title={t("sources.title")}
      intro={t("sources.intro")}
      sections={[
        { title: t("sources.quranTitle"), body: t("sources.quranBody") },
        { title: t("sources.prayerTitle"), body: t("sources.prayerBody") },
        { title: t("sources.haramainTitle"), body: t("sources.haramainBody") },
        { title: t("sources.hijriTitle"), body: t("sources.hijriBody") },
        { title: t("sources.guidesTitle"), body: t("sources.guidesBody") },
        { title: t("sources.fontsTitle"), body: t("sources.fontsBody") },
      ]}
    />
  );
}
