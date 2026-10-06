import { PageHeader } from "@/components/ui/card";
import { QuranHome } from "@/components/quran/quran-home";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/quran", "quran.title");

export default async function QuranPage() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("quran.title")} />
      <QuranHome />
    </>
  );
}
