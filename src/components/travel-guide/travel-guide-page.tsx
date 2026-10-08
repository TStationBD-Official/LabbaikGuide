"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card } from "@/components/ui/card";
import { TRAVEL_GUIDE, TRAVEL_GUIDE_CHECKED, type GuideItem, type GuideTable } from "@/data/guides/travel";
import { lt, type LText } from "@/types/content";
import { cn } from "@/lib/utils";

/** Paragraphs, with "• " lines grouped into lists. */
function Body({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(
      <ul key={`l${blocks.length}`} className="list-disc space-y-1.5 ps-5 marker:text-gold">
        {list.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split("\n").forEach((line) => {
    if (line.startsWith("• ")) list.push(line.slice(2));
    else {
      flush();
      if (line.trim()) blocks.push(<p key={`p${blocks.length}`}>{line}</p>);
    }
  });
  flush();
  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}

function Table({ table }: { table: GuideTable }) {
  const { contentLocale } = useI18n();
  const cell = (c: string | LText) => (typeof c === "string" ? c : lt(c, contentLocale));
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
      {table.note ? <p className="text-xs text-muted-foreground">{lt(table.note, contentLocale)}</p> : null}
    </div>
  );
}

function Item({ item, open, onToggle }: { item: GuideItem; open: boolean; onToggle: () => void }) {
  const { t, contentLocale } = useI18n();
  const id = `g-${item.id}`;
  return (
    <li className="rounded-2xl border border-border bg-card">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-start">
          <span className="flex-1 font-medium leading-snug">{lt(item.title, contentLocale)}</span>
          <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </h3>
      {open ? (
        <div id={id} className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          <Body text={lt(item.body, contentLocale)} />
          {item.table ? <Table table={item.table} /> : null}
          {item.warn ? (
            <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-gold-soft/50 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              {lt(item.warn, contentLocale)}
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

export function TravelGuidePage() {
  const { t, contentLocale, intlLocale } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const q = query.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!q) return TRAVEL_GUIDE;
    const hay = (x: LText | undefined) => (x ? `${x.bn} ${x.en}`.toLowerCase() : "");
    return TRAVEL_GUIDE.map((s) => ({
      ...s,
      items: s.items.filter((i) => [i.title, i.body, i.warn, s.title].some((x) => hay(x).includes(q)) || JSON.stringify(i.table ?? "").toLowerCase().includes(q)),
    })).filter((s) => s.items.length);
  }, [q]);

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
          {TRAVEL_GUIDE.map((s) => (
            <a key={s.id} href={`#s-${s.id}`} className="flex min-h-16 items-center gap-2.5 rounded-2xl border border-border bg-card p-3 text-sm font-medium shadow-soft transition-colors hover:border-gold">
              <span className="text-2xl leading-none" aria-hidden>
                {s.icon}
              </span>
              <span className="leading-snug">{lt(s.title, contentLocale)}</span>
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
              <h2 className="text-lg font-semibold leading-snug">{lt(s.title, contentLocale)}</h2>
              <p className="text-sm text-muted-foreground">{lt(s.summary, contentLocale)}</p>
            </div>
          </Card>
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
