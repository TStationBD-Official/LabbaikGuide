"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error("[ui] render error", error.digest ?? error.message);
  }, [error]);
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p className="text-lg font-medium">{t("errors.generic")}</p>
      <Button onClick={reset}>{t("common.retry")}</Button>
    </div>
  );
}
