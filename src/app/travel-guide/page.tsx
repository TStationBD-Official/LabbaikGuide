import { PageTitle } from "@/components/ui/page-title";
import { TravelGuidePage } from "@/components/travel-guide/travel-guide-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/travel-guide", "travelGuide.title", "travelGuide.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="travelGuide.title" subtitleKey="travelGuide.subtitle" />
      <TravelGuidePage />
    </>
  );
}
