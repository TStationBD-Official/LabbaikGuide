import { PageHeader } from "@/components/ui/card";
import { QiblaView } from "@/components/prayer/qibla-view";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/qibla", "qibla.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={`🧭 ${t("qibla.title")}`} />
      <QiblaView />
    </>
  );
}
