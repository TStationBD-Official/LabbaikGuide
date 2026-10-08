import { PageTitle } from "@/components/ui/page-title";
import { AboutPage } from "@/components/about/about-page";
import { pageMetadata } from "@/i18n/server";
import { getAbout, type AboutData } from "@/server/about/service";

export const generateMetadata = () => pageMetadata("/about", "about.title", "about.subtitle");

export default async function Page() {
  // Server copy for a fast first paint (shared 5-min data cache); the page re-checks for edits itself.
  const initial: AboutData | null = await getAbout().catch(() => null);
  return (
    <>
      <PageTitle titleKey="about.title" subtitleKey="about.subtitle" />
      <AboutPage initial={initial} />
    </>
  );
}
