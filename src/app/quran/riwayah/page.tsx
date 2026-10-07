import { PageTitle } from "@/components/ui/page-title";
import { RiwayahIndex } from "@/components/quran/riwayah";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/quran/riwayah", "riwayah.title");

export default function RiwayahPage() {
  return (
    <>
      <PageTitle titleKey="riwayah.title" subtitleKey="riwayah.subtitle" />
      <RiwayahIndex />
    </>
  );
}
