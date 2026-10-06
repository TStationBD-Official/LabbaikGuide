import { PageHeader } from "@/components/ui/card";
import { RitualCounterView } from "@/components/manasik/ritual-counter";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/sai", "sai.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("sai.title")} />
      <RitualCounterView kind="sai" />
    </>
  );
}
