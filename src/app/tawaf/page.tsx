import { PageTitle } from "@/components/ui/page-title";
import { RitualCounterView } from "@/components/manasik/ritual-counter";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/tawaf", "tawaf.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="tawaf.title" />
      <RitualCounterView kind="tawaf" />
    </>
  );
}
