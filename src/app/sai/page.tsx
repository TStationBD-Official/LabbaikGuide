import { PageTitle } from "@/components/ui/page-title";
import { RitualCounterView } from "@/components/manasik/ritual-counter";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/sai", "sai.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="sai.title" />
      <RitualCounterView kind="sai" />
    </>
  );
}
