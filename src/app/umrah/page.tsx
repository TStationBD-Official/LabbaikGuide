import { PageHeader } from "@/components/ui/card";
import { UmrahGuide } from "@/components/manasik/guide";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/umrah", "manasik.umrahGuide", "manasik.umrahDesc");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={`🕋 ${t("manasik.umrahGuide")}`} subtitle={t("manasik.umrahDesc")} />
      <UmrahGuide />
    </>
  );
}
