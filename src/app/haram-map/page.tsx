import { PageTitle } from "@/components/ui/page-title";
import { HaramMapPage } from "@/components/haram-map/haram-map-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/haram-map", "haramMap.title", "haramMap.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="haramMap.title" subtitleKey="haramMap.subtitle" />
      <HaramMapPage />
    </>
  );
}
