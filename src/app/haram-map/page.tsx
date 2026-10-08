import { PageTitle } from "@/components/ui/page-title";
import { HaramMapPage } from "@/components/haram-map/haram-map-page";
import { pageMetadata } from "@/i18n/server";
import { isLocationId } from "@/config/locations";

export const generateMetadata = () => pageMetadata("/haram-map", "haramMap.title", "haramMap.subtitle");

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // ?loc=makkah | madinah — opened from the home card for the city selected there.
  const loc = (await searchParams).loc;
  return (
    <>
      <PageTitle titleKey="haramMap.title" subtitleKey="haramMap.subtitle" />
      <HaramMapPage initialLoc={isLocationId(loc) ? loc : undefined} />
    </>
  );
}
