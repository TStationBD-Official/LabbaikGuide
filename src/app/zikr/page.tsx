import { Suspense } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { ZikrHub } from "@/components/zikr/zikr-hub";
import { SkeletonList } from "@/components/ui/states";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/zikr", "zikr.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="zikr.title" />
      <Suspense fallback={<SkeletonList rows={5} />}>
        <ZikrHub />
      </Suspense>
    </>
  );
}
