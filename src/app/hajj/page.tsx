import { PageTitle } from "@/components/ui/page-title";
import { HajjGuide } from "@/components/manasik/guide";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/hajj", "manasik.hajjGuide", "manasik.hajjDesc");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="manasik.hajjGuide" subtitleKey="manasik.hajjDesc" />
      <HajjGuide />
    </>
  );
}
