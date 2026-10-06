import { PageTitle } from "@/components/ui/page-title";
import { DuaLibrary } from "@/components/dua/dua-library";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/duas", "dua.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="dua.title" prefix="🤲" />
      <DuaLibrary />
    </>
  );
}
