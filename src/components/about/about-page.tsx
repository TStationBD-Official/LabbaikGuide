"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronRight, Globe, Mail, MapPin, MessageCircle, Phone, Briefcase } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge, Card, SectionHeader } from "@/components/ui/card";
import { SkeletonList, UnavailableNotice } from "@/components/ui/states";
import { aboutImage, useAbout, type AboutApp, type AboutData } from "@/services/about";
import { cn } from "@/lib/utils";

/** Image from the panel; falls back to initials if it cannot load. */
export function PanelImage({
  src,
  w,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  w?: 96 | 192 | 480 | 960;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <>{fallback ?? null}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- served by our own cached proxy
    <img src={aboutImage(src, w)} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(src)} className={className} />
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn("grid place-items-center bg-primary/10 font-semibold text-primary", className)}>
      {initials(name)}
    </span>
  );
}

/** Only numbers written with a country code can open WhatsApp reliably. */
const waLink = (n: string) => (/^(\+|00)\d{8,15}$/.test(n.replace(/[\s()-]/g, "")) ? `https://wa.me/${n.replace(/\D/g, "").replace(/^00/, "")}` : null);
const telLink = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

function ContactRow({ href, icon, label, value }: { href?: string | null; icon: ReactNode; label: string; value: string }) {
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-medium" dir="ltr">
          {value}
        </span>
      </span>
      {href ? <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden /> : null}
    </>
  );
  const cls = "flex min-h-14 items-center gap-3 px-4 py-2";
  if (!href) return <li className={cls}>{body}</li>;
  const external = /^https?:/.test(href);
  return (
    <li>
      <a href={href} className={cn(cls, "hover:bg-muted")} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {body}
      </a>
    </li>
  );
}

const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

export function AppCard({ app, featured }: { app: AboutApp; featured: boolean }) {
  const { t } = useI18n();
  return (
    <li>
      <Link
        href={`/about/apps/${app.id}`}
        className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft transition-colors hover:border-gold"
      >
        <PanelImage
          src={app.logo}
          w={192}
          alt=""
          className="size-16 shrink-0 rounded-2xl border border-border object-cover"
          fallback={<Initials name={app.name} className="size-16 shrink-0 rounded-2xl text-lg" />}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{app.name}</span>
            {featured ? <Badge tone="gold">{t("about.featured")}</Badge> : null}
          </span>
          {app.shortDescription ? <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{app.shortDescription}</span> : null}
          <span className="mt-1 block text-xs text-muted-foreground">
            {[app.version ? t("about.version", { v: app.version }) : null, app.category].filter(Boolean).join(" · ")}
          </span>
        </span>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
      </Link>
    </li>
  );
}

export function AboutPage({ initial }: { initial: AboutData | null }) {
  const { t } = useI18n();
  const q = useAbout(initial);

  if (!q.data) {
    return q.isPending ? <SkeletonList rows={4} /> : <UnavailableNotice message={t("about.unavailable")} />;
  }
  const { company: c, apps } = q.data;
  const featured = new Set(c.featuredAppIds);
  const contacts = [
    c.websiteUrl && { href: c.websiteUrl, icon: <Globe className="size-4" />, label: t("about.website"), value: hostOf(c.websiteUrl) },
    c.playStoreUrl && { href: c.playStoreUrl, icon: <PlayIcon />, label: t("about.playStore"), value: t("about.allOurApps") },
    c.whatsappNumber && { href: waLink(c.whatsappNumber) ?? telLink(c.whatsappNumber), icon: <MessageCircle className="size-4" />, label: t("about.whatsapp"), value: c.whatsappNumber },
    c.contactNumber && { href: telLink(c.contactNumber), icon: <Phone className="size-4" />, label: t("about.phone"), value: c.contactNumber },
    c.supportEmail && { href: `mailto:${c.supportEmail}`, icon: <Mail className="size-4" />, label: t("about.supportEmail"), value: c.supportEmail },
    c.freelanceEmail && { href: `mailto:${c.freelanceEmail}`, icon: <Briefcase className="size-4" />, label: t("about.freelanceEmail"), value: c.freelanceEmail },
    c.location && { href: null, icon: <MapPin className="size-4" />, label: t("about.location"), value: c.location },
  ].filter(Boolean) as { href: string | null; icon: ReactNode; label: string; value: string }[];
  const socials = (
    [
      ["Facebook", c.facebookUrl],
      ["Instagram", c.instagramUrl],
      ["TikTok", c.tiktokUrl],
      ["LinkedIn", c.linkedinUrl],
    ] as const
  ).filter(([, u]) => u) as [string, string][];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {q.isError ? <UnavailableNotice message={t("about.showingSaved")} /> : null}

      <Card className="overflow-hidden p-0">
        {c.banner ? (
          <PanelImage src={c.banner} w={960} alt="" className="aspect-[3/1] w-full object-cover" />
        ) : (
          <div aria-hidden className="h-20 bg-[radial-gradient(120%_120%_at_0%_0%,color-mix(in_oklab,var(--gold)_35%,transparent),transparent),linear-gradient(135deg,var(--primary),color-mix(in_oklab,var(--primary)_60%,black))]" />
        )}
        <div className="px-5 pb-6">
          <PanelImage
            src={c.logo}
            w={192}
            alt={c.name}
            className="-mt-10 size-20 rounded-2xl border-4 border-card bg-card object-cover shadow-soft"
            fallback={<Initials name={c.name} className="-mt-10 size-20 rounded-2xl border-4 border-card text-2xl" />}
          />
          <h2 className="mt-3 text-2xl font-bold">{c.name}</h2>
          {c.description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p> : null}
          {c.longDescription ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{c.longDescription}</p> : null}
        </div>
      </Card>

      {contacts.length ? (
        <section>
          <SectionHeader title={t("about.contact")} />
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {contacts.map((x) => (
              <ContactRow key={x.label} {...x} />
            ))}
          </ul>
          {socials.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {socials.map(([name, u]) => (
                <a key={name} href={u} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-gold">
                  {name}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section>
        <SectionHeader title={t("about.apps")} />
        {apps.length ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {apps.map((a) => (
              <AppCard key={a.id} app={a} featured={featured.has(a.id)} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t("about.noApps")}</p>
        )}
      </section>
    </div>
  );
}

export function PlayIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M4.5 2.8a1 1 0 0 0-.5.87v16.66a1 1 0 0 0 .5.87l9.4-9.2-9.4-9.2Zm10.9 7.73L6.3 1.6l11.45 6.6-2.35 2.33Zm0 2.94 2.35 2.33L6.3 22.4l9.1-8.93Zm3.67-4.5 2.37 1.37a1 1 0 0 1 0 1.73l-2.37 1.37-2.6-2.23 2.6-2.24Z" />
    </svg>
  );
}
