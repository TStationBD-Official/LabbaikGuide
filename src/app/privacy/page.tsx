import { InfoPage } from "@/components/common/info-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/privacy", "privacy.title", "privacy.intro");

export default function Page() {
  return (
    <InfoPage
      titleKey="privacy.title"
      introKey="privacy.intro"
      sections={[
        { title: "privacy.localTitle", body: "privacy.localBody" },
        { title: "privacy.locationTitle", body: "privacy.locationBody" },
        { title: "privacy.networkTitle", body: "privacy.networkBody" },
        { title: "privacy.analyticsTitle", body: "privacy.analyticsBody" },
        { title: "privacy.notifTitle", body: "privacy.notifBody" },
      ]}
    />
  );
}
