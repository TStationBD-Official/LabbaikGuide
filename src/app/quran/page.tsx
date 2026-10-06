import { PageTitle } from "@/components/ui/page-title";
import { QuranHome } from "@/components/quran/quran-home";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/quran", "quran.title");

export default function QuranPage() {
  return (
    <>
      <PageTitle titleKey="quran.title" />
      <QuranHome />
    </>
  );
}
