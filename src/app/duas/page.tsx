import { PageHeader } from "@/components/ui/card";
import { DuaLibrary } from "@/components/dua/dua-library";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/duas", "dua.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={`🤲 ${t("dua.title")}`} />
      <DuaLibrary />
    </>
  );
}
