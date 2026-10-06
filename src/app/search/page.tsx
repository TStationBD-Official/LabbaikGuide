import { Suspense } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { GlobalSearch } from "@/components/search/global-search";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/search", "search.title", "search.hint");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="search.title" />
      <Suspense>
        <GlobalSearch />
      </Suspense>
    </>
  );
}
