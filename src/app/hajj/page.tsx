import { PageHeader } from "@/components/ui/card";
import { HajjGuide } from "@/components/manasik/guide";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/hajj", "manasik.hajjGuide", "manasik.hajjDesc");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("manasik.hajjGuide")} subtitle={t("manasik.hajjDesc")} />
      <HajjGuide />
    </>
  );
}
