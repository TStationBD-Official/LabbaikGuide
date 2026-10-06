import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { GlobalSearch } from "@/components/search/global-search";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/search", "search.title", "search.hint");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("search.title")} />
      <Suspense>
        <GlobalSearch />
      </Suspense>
    </>
  );
}
