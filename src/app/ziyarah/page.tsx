import { PageTitle } from "@/components/ui/page-title";
import { ZiyarahPage } from "@/components/ziyarah/ziyarah-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/ziyarah", "ziyarah.title", "ziyarah.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="ziyarah.title" subtitleKey="ziyarah.subtitle" />
      <ZiyarahPage />
    </>
  );
}
