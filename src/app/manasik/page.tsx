import { PageHeader } from "@/components/ui/card";
import { ManasikHub } from "@/components/manasik/manasik-hub";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/manasik", "manasik.title", "manasik.subtitle");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("manasik.title")} subtitle={t("manasik.subtitle")} />
      <ManasikHub />
    </>
  );
}
