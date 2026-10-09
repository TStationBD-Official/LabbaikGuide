import { PageTitle } from "@/components/ui/page-title";
import { LivePage } from "@/components/live/live-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/live", "live.title", "live.subtitle");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="live.title" subtitleKey="live.subtitle" />
      <LivePage />
    </>
  );
}
