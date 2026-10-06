"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Card, PageHeader } from "@/components/ui/card";
import type { TKey } from "@/i18n";

/** Long-form page (Sources, Privacy), translated on the device so it follows language changes offline. */
export function InfoPage({ titleKey, introKey, sections }: { titleKey: TKey; introKey: TKey; sections: { title: TKey; body: TKey }[] }) {
  const { t } = useI18n();
  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader title={t(titleKey)} subtitle={t(introKey)} />
      <div className="space-y-4">
        {sections.map((s) => (
          <Card key={s.title} className="p-5">
            <h2 className="mb-2 font-semibold text-primary">{t(s.title)}</h2>
            <p className="leading-relaxed text-foreground/90">{t(s.body)}</p>
          </Card>
        ))}
      </div>
    </article>
  );
}
