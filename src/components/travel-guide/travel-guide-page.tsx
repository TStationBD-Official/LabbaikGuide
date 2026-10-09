"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink, Landmark, Search, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { AUDIENCES, gt, TRAVEL_GUIDE, TRAVEL_GUIDE_CHECKED, type Audience, type GText, type GuideApp, type GuideItem, type GuideTable } from "@/data/guides/travel";
import { cn } from "@/lib/utils";

/** Phone numbers, USSD codes and similar stay left-to-right inside Urdu/Arabic text. */
const LTR_TOKEN = /([*+]?\d[\d\s*#()+-]{3,}[\d#]|\*\d+(?:\*[^#\s]*)?#)/g;
function Ltr({ text }: { text: string }) {
  const parts = text.split(LTR_TOKEN);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <bdi key={i} dir="ltr" className="whitespace-nowrap">
            {p.trim()}
          </bdi>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Paragraphs, with "• " lines grouped into lists. */
function Body({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(
      <ul key={`l${blocks.length}`} className="list-disc space-y-1.5 ps-5 marker:text-gold">
        {list.map((l, i) => (
          <li key={i}>
            <Ltr text={l} />
          </li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split("\n").forEach((line) => {
    if (line.startsWith("• ")) list.push(line.slice(2));
    else {
      flush();
      if (line.trim())
        blocks.push(
          <p key={`p${blocks.length}`}>
            <Ltr text={line} />
          </p>,
        );
    }
  });
  flush();
  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}

function Table({ table }: { table: GuideTable }) {
  const { locale } = useI18n();
  const cell = (c: string | GText) => (typeof c === "string" ? c : gt(c, locale));
  return (
    <div className="space-y-1.5">
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[28rem] border-separate border-spacing-0 overflow-hidden rounded-xl border border-border text-sm">
          <thead>
            <tr className="bg-muted">
              {table.head.map((h, i) => (
                <th key={i} className="px-3 py-2 text-start text-xs font-semibold text-muted-foreground">
                  {cell(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i} className="even:bg-muted/40">
                {r.map((c, j) => (
                  <td key={j} className={cn("border-t border-border px-3 py-2 align-top", j === 0 && "font-medium")} dir="auto">
                    {cell(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note ? <p className="text-xs text-muted-foreground">{gt(table.note, locale)}</p> : null}
    </div>
  );
}

function Item({ item, open, onToggle }: { item: GuideItem; open: boolean; onToggle: () => void }) {
  const { t, locale } = useI18n();
  const id = `g-${item.id}`;
  return (
    <li className="rounded-2xl border border-border bg-card">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-start">
          <span className="flex-1 font-medium leading-snug">{gt(item.title, locale)}</span>
          <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </h3>
      {open ? (
        <div id={id} className="space-y-3 border-t border-border px-4 pb-4 pt-3" dir={locale === "ur" && item.body.ur ? "rtl" : undefined}>
          <Body text={gt(item.body, locale)} />
          {item.table ? <Table table={item.table} /> : null}
          {item.warn ? (
            <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-gold-soft/50 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              {gt(item.warn, locale)}
            </p>
          ) : null}
          <div className="text-xs">
            <p className="mb-1 font-medium text-gold">{t("travelGuide.sources")}</p>
            <ul className="space-y-1">
              {item.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-primary hover:underline">
                    <span>
                      {s.label}
                      {s.date ? <span className="text-muted-foreground"> · {s.date}</span> : null}
                    </span>
                    <ExternalLink className="mt-0.5 size-3 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function StoreButton({ href, label, kind }: { href: string; label: string; kind: "play" | "ios" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground px-3 text-xs font-semibold text-background hover:opacity-90"
    >
      {kind === "play" ? (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
          <path d="M4.5 2.8a1 1 0 0 0-.5.87v16.66a1 1 0 0 0 .5.87l9.4-9.2-9.4-9.2Zm10.9 7.73L6.3 1.6l11.45 6.6-2.35 2.33Zm0 2.94 2.35 2.33L6.3 22.4l9.1-8.93Zm3.67-4.5 2.37 1.37a1 1 0 0 1 0 1.73l-2.37 1.37-2.6-2.23 2.6-2.24Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
          <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1ZM13.9 4.9c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5Z" />
        </svg>
      )}
      {label}
    </a>
  );
}

function AppCard({ app }: { app: GuideApp }) {
  const { locale } = useI18n();
  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <div>
        <p className="font-semibold">{app.name}</p>
        <p className="text-sm text-muted-foreground" dir="auto">
          {gt(app.purpose, locale)}
        </p>
        {app.note ? (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-warning" dir="auto">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {gt(app.note, locale)}
          </p>
        ) : null}
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {app.play ? <StoreButton href={app.play} label="Google Play" kind="play" /> : null}
        {app.ios ? <StoreButton href={app.ios} label="App Store" kind="ios" /> : null}
      </div>
    </li>
  );
}

const COUNTRY_KEY = "hc_guide_country";
const COUNTRY_FLAG: Record<Audience, string> = { bd: "🇧🇩", pk: "🇵🇰", in: "🇮🇳", intl: "🌍" };
const defaultAudience = (locale: string): Audience => (locale === "bn" ? "bd" : locale === "ur" ? "pk" : "intl");
const forAudience = (a: Audience) => (x: { audience?: Audience[] }) => !x.audience || x.audience.includes(a);

export function TravelGuidePage() {
  const { t, locale, intlLocale } = useI18n();
  const [query, setQuery] = useState("");
  // Where the user comes from: chooses roaming, embassy and health items. Defaults from the language.
  const [audience, setAudience] = useState<Audience>(() => defaultAudience(locale));
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY) as Audience | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved choice after mount
      if (saved && AUDIENCES.includes(saved)) setAudience(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const pickAudience = (a: Audience) => {
    setAudience(a);
    try {
      localStorage.setItem(COUNTRY_KEY, a);
    } catch {
      /* storage unavailable */
    }
  };
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const q = query.trim().toLowerCase();

  const sections = useMemo(() => {
    const hay = (x: GText | undefined) => (x ? `${x.en} ${x.bn ?? ""} ${x.ur ?? ""}`.toLowerCase() : "");
    return TRAVEL_GUIDE.map((s) => ({
      ...s,
      apps: s.apps?.filter(forAudience(audience)).filter((a) => !q || `${a.name} ${hay(a.purpose)}`.toLowerCase().includes(q)),
      items: s.items
        .filter(forAudience(audience))
        .filter((i) => !q || [i.title, i.body, i.warn, s.title].some((x) => hay(x).includes(q)) || JSON.stringify(i.table ?? "").toLowerCase().includes(q)),
    })).filter((s) => s.items.length || s.apps?.length);
  }, [q, audience]);

  const checked = new Intl.DateTimeFormat(intlLocale, { dateStyle: "long" }).format(new Date(`${TRAVEL_GUIDE_CHECKED}T12:00:00Z`));
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-2xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        <span>
          {t("travelGuide.checked", { date: checked })} {t("travelGuide.changeNote")}
        </span>
      </p>

      <Link
        href="/ziyarah"
        className="group flex items-center gap-3 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold-soft to-card p-4 shadow-soft transition-colors hover:border-gold"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-white" aria-hidden>
          <Landmark className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug">{t("ziyarah.guideCardTitle")}</span>
          <span className="block text-sm text-muted-foreground">{t("ziyarah.guideCardSub")}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
      </Link>

      <div role="radiogroup" aria-label={t("travelGuide.from")} className="space-y-2">
        <p className="text-sm font-medium">{t("travelGuide.from")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AUDIENCES.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={audience === a}
              onClick={() => pickAudience(a)}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors",
                audience === a ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground",
              )}
            >
              <span aria-hidden>{COUNTRY_FLAG[a]}</span>
              {t(`travelGuide.c_${a}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("travelGuide.search")}
          aria-label={t("travelGuide.search")}
          className="h-12 w-full rounded-2xl border border-border bg-card ps-9 pe-3 text-sm"
        />
      </div>

      {!q ? (
        <nav aria-label={t("travelGuide.title")} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {sections.map((s) => (
            <a key={s.id} href={`#s-${s.id}`} className="flex min-h-16 items-center gap-2.5 rounded-2xl border border-border bg-card p-3 text-sm font-medium shadow-soft transition-colors hover:border-gold">
              <span className="text-2xl leading-none" aria-hidden>
                {s.icon}
              </span>
              <span className="leading-snug">{gt(s.title, locale)}</span>
            </a>
          ))}
        </nav>
      ) : null}

      {sections.length === 0 ? <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</p> : null}

      {sections.map((s) => (
        <section key={s.id} id={`s-${s.id}`} className="scroll-mt-24">
          <Card className="mb-3 flex items-center gap-3 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-soft text-2xl" aria-hidden>
              {s.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-snug">{gt(s.title, locale)}</h2>
              <p className="text-sm text-muted-foreground">{gt(s.summary, locale)}</p>
            </div>
          </Card>
          {s.apps?.length ? (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {s.apps.map((a) => (
                <AppCard key={a.id} app={a} />
              ))}
            </ul>
          ) : null}
          <ul className="space-y-2">
            {s.items.map((i) => (
              <Item key={i.id} item={i} open={Boolean(q) || open.has(i.id)} onToggle={() => toggle(i.id)} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
