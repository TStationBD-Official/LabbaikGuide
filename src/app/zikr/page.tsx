import { PageHeader } from "@/components/ui/card";
import { ZikrPage } from "@/components/zikr/zikr-page";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/zikr", "zikr.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("zikr.title")} />
      <ZikrPage />
    </>
  );
}
