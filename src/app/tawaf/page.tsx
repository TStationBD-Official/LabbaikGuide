import { PageHeader } from "@/components/ui/card";
import { RitualCounterView } from "@/components/manasik/ritual-counter";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/tawaf", "tawaf.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("tawaf.title")} />
      <RitualCounterView kind="tawaf" />
    </>
  );
}
