import { PageTitle } from "@/components/ui/page-title";
import { ZikrPage } from "@/components/zikr/zikr-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/zikr", "zikr.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="zikr.title" />
      <ZikrPage />
    </>
  );
}
