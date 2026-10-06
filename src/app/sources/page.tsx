import { InfoPage } from "@/components/common/info-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/sources", "sources.title", "sources.intro");

export default function Page() {
  return (
    <InfoPage
      titleKey="sources.title"
      introKey="sources.intro"
      sections={[
        { title: "sources.quranTitle", body: "sources.quranBody" },
        { title: "sources.prayerTitle", body: "sources.prayerBody" },
        { title: "sources.haramainTitle", body: "sources.haramainBody" },
        { title: "sources.hijriTitle", body: "sources.hijriBody" },
        { title: "sources.guidesTitle", body: "sources.guidesBody" },
        { title: "sources.mapsTitle", body: "sources.mapsBody" },
        { title: "sources.fontsTitle", body: "sources.fontsBody" },
      ]}
    />
  );
}
