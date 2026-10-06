import Link from "next/link";
import { getServerT } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getServerT();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p className="font-display text-6xl text-gold">۞</p>
      <h1 className="text-xl font-semibold">{t("errors.pageNotFound")}</h1>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-primary-foreground">
        {t("errors.goHome")}
      </Link>
    </div>
  );
}
