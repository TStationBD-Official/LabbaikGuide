import { PageTitle } from "@/components/ui/page-title";
import { ManasikHub } from "@/components/manasik/manasik-hub";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/manasik", "manasik.title", "manasik.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="manasik.title" subtitleKey="manasik.subtitle" />
      <ManasikHub />
    </>
  );
}
