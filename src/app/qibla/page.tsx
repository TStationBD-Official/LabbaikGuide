import { PageTitle } from "@/components/ui/page-title";
import { QiblaView } from "@/components/prayer/qibla-view";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/qibla", "qibla.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="qibla.title" prefix="🧭" />
      <QiblaView />
    </>
  );
}
