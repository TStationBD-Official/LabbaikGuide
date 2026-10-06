import { PageHeader } from "@/components/ui/card";
import { SettingsPage } from "@/components/settings/settings-page";
import { getServerT, pageMetadata } from "@/i18n/server";

export const generateMetadata = () => pageMetadata("/settings", "settings.title");

export default async function Page() {
  const { t } = await getServerT();
  return (
    <>
      <PageHeader title={t("settings.title")} />
      <SettingsPage />
    </>
  );
}
