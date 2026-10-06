import { PageTitle } from "@/components/ui/page-title";
import { SettingsPage } from "@/components/settings/settings-page";
import { pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/settings", "settings.title");

export default function Page() {
  return (
    <>
      <PageTitle titleKey="settings.title" />
      <SettingsPage />
    </>
  );
}
