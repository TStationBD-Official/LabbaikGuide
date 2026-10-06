"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import type { TKey } from "@/i18n";
import { PageHeader } from "./card";

/**
 * Page title translated on the device, so it switches instantly with the
 * language (also offline) instead of keeping the server-rendered language.
 */
export function PageTitle({ titleKey, subtitleKey, prefix }: { titleKey: TKey; subtitleKey?: TKey; prefix?: string }) {
  const { t } = useI18n();
  return <PageHeader title={prefix ? `${prefix} ${t(titleKey)}` : t(titleKey)} subtitle={subtitleKey ? t(subtitleKey) : undefined} />;
}
