"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { FOOTER_NAV, MORE_ICON, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/config/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useOnline } from "@/hooks/use-online";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { AccentSelector, LanguageSelector, LocationSwitcher } from "./selectors";
import { InstallPrompt } from "./install-prompt";
import { Notifier } from "./notifier";

function isActive(item: NavItem, path: string) {
  return item.match ? item.match(path) : path === item.href;
}

function OfflineBanner() {
  const online = useOnline();
  const { t } = useI18n();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-50 bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground">
      <strong className="font-semibold">{t("common.offline")}</strong>
      <span className="ms-2 opacity-80">{t("common.offlineDesc")}</span>
    </div>
  );
}

function SidebarLink({ item, path }: { item: NavItem; path: string }) {
  const { t } = useI18n();
  const active = isActive(item, path);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-[1.15rem]" aria-hidden />
      {t(item.labelKey)}
    </Link>
  );
}

function Sidebar({ path }: { path: string }) {
  const { t } = useI18n();
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-e border-border/70 bg-card/40 px-4 py-5 backdrop-blur lg:flex">
      <Logo />
      <div className="mt-5">
        <LocationSwitcher size="sm" />
      </div>
      <nav aria-label={t("nav.mainNav")} className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto">
        {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
          <SidebarLink key={item.href} item={item} path={path} />
        ))}
      </nav>
      <div className="gold-rule my-3" aria-hidden />
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        {FOOTER_NAV.map((f) => (
          <Link key={f.href} href={f.href} className="hover:text-foreground">
            {t(f.labelKey)}
          </Link>
        ))}
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { t } = useI18n();
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/60 px-4 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <Link
          href="/search"
          aria-label={t("nav.search")}
          className="grid size-11 place-items-center rounded-full border border-border bg-card/70"
        >
          <Search className="size-5" aria-hidden />
        </Link>
      </div>
      <div className="mt-2.5">
        <LocationSwitcher size="sm" />
      </div>
    </header>
  );
}

function BottomNav({ path, onMore }: { path: string; onMore: () => void }) {
  const { t } = useI18n();
  const moreActive = SECONDARY_NAV.some((i) => isActive(i, path)) || FOOTER_NAV.some((i) => isActive(i, path));
  const itemCls = (active: boolean) =>
    cn(
      "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );
  return (
    <nav
      aria-label={t("nav.mainNav")}
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60 safe-bottom lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item, path);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex flex-1">
              <Link href={item.href} aria-current={active ? "page" : undefined} className={itemCls(active)}>
                {active ? <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" /> : null}
                <Icon className="size-[1.35rem]" aria-hidden strokeWidth={active ? 2.3 : 1.8} />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMore} className={itemCls(moreActive)} aria-haspopup="dialog">
            <MORE_ICON className="size-[1.35rem]" aria-hidden />
            {t("nav.more")}
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t("nav.more")}>
      <nav aria-label={t("nav.more")}>
        <ul className="grid auto-rows-fr grid-cols-3 gap-2">
          {[...SECONDARY_NAV, ...FOOTER_NAV].map((item) => {
            const Icon = item.icon;
            const active = isActive(item, path);
            return (
              <li key={item.href} className="h-full">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-20 flex-col items-center justify-start gap-1.5 rounded-2xl border p-2 text-center text-xs font-medium",
                    active ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <Icon className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                  <span className="line-clamp-2 min-h-[2lh] leading-tight">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">{t("language.label")}</p>
        <LanguageSelector compact />
      </div>
      <div className="mt-5">
        <AccentSelector />
      </div>
    </Sheet>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("app.skipToContent")}
      </a>
      <div className="app-backdrop" aria-hidden />
      <OfflineBanner />
      <div className="flex min-h-dvh">
        <Sidebar path={path} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
      <BottomNav path={path} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} path={path} />
      <InstallPrompt />
      <Notifier />
    </>
  );
}
