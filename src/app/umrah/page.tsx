import { PageTitle } from "@/components/ui/page-title";
import { UmrahGuide } from "@/components/manasik/guide";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/umrah", "manasik.umrahGuide", "manasik.umrahDesc");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="manasik.umrahGuide" subtitleKey="manasik.umrahDesc" prefix="🕋" />
      <UmrahGuide />
    </>
  );
}
