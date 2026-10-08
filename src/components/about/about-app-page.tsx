"use client";

import Link from "next/link";
import { ChevronLeft, Code2, ExternalLink, Globe, Mail, Monitor } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { useAbout, type AboutData } from "@/services/about";
import { PanelImage, PlayIcon } from "./about-page";

function GetButton({ href, icon, label, primary }: { href: string; icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          : "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
      }
    >
      {icon}
      {label}
    </a>
  );
}

export function AboutAppPage({ id, initial }: { id: string; initial: AboutData | null }) {
  const { t } = useI18n();
  const q = useAbout(initial);
  const back = (
    <Link href="/about" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
      {t("about.title")}
    </Link>
  );

  if (!q.data) return q.isPending ? <SkeletonList rows={4} /> : <div className="space-y-4">{back}<UnavailableNotice message={t("about.unavailable")} /></div>;
  const app = q.data.apps.find((a) => a.id === id);
  if (!app) return <div className="space-y-4">{back}<UnavailableNotice message={t("about.appGone")} /></div>;

  const links = [
    app.playStoreUrl && { href: app.playStoreUrl, icon: <PlayIcon />, label: t("about.getOnPlay"), primary: true },
    app.website && { href: app.website, icon: <Globe className="size-4" />, label: t("about.website") },
    app.windowsDownloadUrl && { href: app.windowsDownloadUrl, icon: <Monitor className="size-4" />, label: t("about.download", { os: "Windows" }) },
    app.macosDownloadUrl && { href: app.macosDownloadUrl, icon: <Monitor className="size-4" />, label: t("about.download", { os: "macOS" }) },
    app.linuxDownloadUrl && { href: app.linuxDownloadUrl, icon: <Monitor className="size-4" />, label: t("about.download", { os: "Linux" }) },
    app.github && { href: app.github, icon: <Code2 className="size-4" />, label: t("about.github") },
  ].filter(Boolean) as { href: string; icon: ReactNode; label: string; primary?: boolean }[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {back}
      {q.isError ? <UnavailableNotice message={t("about.showingSaved")} /> : null}

      <Card className="overflow-hidden p-0">
        {app.banner ? <PanelImage src={app.banner} w={960} alt="" className="aspect-[2/1] w-full object-cover sm:aspect-[3/1]" /> : null}
        <div className="flex items-start gap-4 p-5">
          <PanelImage src={app.logo} w={192} alt="" className="size-20 shrink-0 rounded-2xl border border-border object-cover" />
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{app.name}</h2>
            {app.shortDescription ? <p className="mt-1 text-sm text-muted-foreground">{app.shortDescription}</p> : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.version ? <Badge>{t("about.version", { v: app.version })}</Badge> : null}
              {app.category ? <Badge>{app.category}</Badge> : null}
              {app.platforms.map((p) => (
                <Badge key={p} tone="gold">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {links.length ? (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
            {links.map((l) => (
              <GetButton key={l.href} {...l} />
            ))}
          </div>
        ) : null}
      </Card>

      {app.screenshots.length ? (
        <section>
          <SectionHeader title={t("about.screenshots")} />
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {app.screenshots.map((s, i) => (
              <li key={s} className="shrink-0 snap-start">
                <a href={s} target="_blank" rel="noopener noreferrer" aria-label={`${t("about.screenshots")} ${i + 1}`}>
                  <PanelImage src={s} w={480} alt="" className="h-80 w-auto rounded-2xl border border-border bg-muted object-contain sm:h-96" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {app.longDescription ? (
        <section>
          <SectionHeader title={t("about.description")} />
          <Card>
            <p className="whitespace-pre-line text-sm leading-relaxed">{app.longDescription}</p>
          </Card>
        </section>
      ) : null}

      {app.releaseNotes ? (
        <section>
          <SectionHeader title={t("about.releaseNotes")} />
          <Card>
            <p className="whitespace-pre-line text-sm leading-relaxed">{app.releaseNotes}</p>
          </Card>
        </section>
      ) : null}

      {app.supportEmail || app.privacyPolicyUrl || app.termsUrl ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {app.supportEmail ? (
            <a href={`mailto:${app.supportEmail}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              <Mail className="size-4" aria-hidden />
              {t("about.supportEmail")}
            </a>
          ) : null}
          {app.privacyPolicyUrl ? (
            <a href={app.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              <ExternalLink className="size-4" aria-hidden />
              {t("about.privacy")}
            </a>
          ) : null}
          {app.termsUrl ? (
            <a href={app.termsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              <ExternalLink className="size-4" aria-hidden />
              {t("about.terms")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
