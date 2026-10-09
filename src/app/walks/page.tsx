import { PageTitle } from "@/components/ui/page-title";
import { WalksPage } from "@/components/walks/walks-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/walks", "walks.title", "walks.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="walks.title" subtitleKey="walks.subtitle" />
      <WalksPage />
    </>
  );
}
