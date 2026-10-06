import { PageTitle } from "@/components/ui/page-title";
import { HotelView } from "@/components/places/hotel-view";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/hotel", "hotel.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="hotel.title" subtitleKey="hotel.subtitle" prefix="🏨" />
      <HotelView />
    </>
  );
}
