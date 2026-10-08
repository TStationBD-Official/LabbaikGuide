import { PageTitle } from "@/components/ui/page-title";
import { JanazahPage } from "@/components/janazah/janazah-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/janazah", "janazah.title", "janazah.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="janazah.title" subtitleKey="janazah.subtitle" />
      <JanazahPage />
    </>
  );
}
