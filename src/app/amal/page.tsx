import { PageTitle } from "@/components/ui/page-title";
import { AmalPage } from "@/components/amal/amal-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/amal", "amal.title", "amal.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="amal.title" subtitleKey="amal.subtitle" />
      <AmalPage />
    </>
  );
}
