"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { FOOTER_NAV, PRIMARY_NAV, SECONDARY_NAV } from "@/config/navigation";
import type { TKey } from "@/i18n";

/**
 * In-app navigation history (paths only), so "Back" can return to the page the user actually came
 * from — and never leaves the app. Opening a page directly falls back to its parent page.
 */
let stack: string[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getStack = () => stack;
const serverStack: string[] = [];

function record(path: string) {
  if (stack[stack.length - 1] === path) return;
  // Browser/back-button navigation to the previous page: pop instead of push.
  stack = stack[stack.length - 2] === path ? stack.slice(0, -1) : [...stack, path].slice(-50);
  emit();
}

/** Top-level destinations (bottom navigation) don't get a back button. */
const ROOTS = new Set(["/", "/quran", "/zikr", "/manasik"]);

/** Where "Back" goes when there is no earlier page in this visit. */
export function parentOf(path: string): string {
  if (path.startsWith("/quran/riwayah/")) return "/quran/riwayah";
  if (path.startsWith("/quran/") || path.startsWith("/qcf/")) return "/quran";
  if (["/umrah", "/hajj", "/tawaf", "/sai"].some((p) => path === p || path.startsWith(`${p}/`))) return "/manasik";
  return "/";
}

const EXTRA: Record<string, TKey> = { "/umrah": "nav.umrah", "/hajj": "nav.hajj" };

/** Name of the page at `path`, for the button label ("← Home", "← Manasik"…). */
function labelKeyOf(path: string): TKey | null {
  if (path === "/") return "nav.home";
  if (EXTRA[path]) return EXTRA[path];
  const exact = [...SECONDARY_NAV, ...FOOTER_NAV, ...PRIMARY_NAV].find((n) => n.href === path);
  if (exact) return exact.labelKey;
  const loose = [...SECONDARY_NAV, ...PRIMARY_NAV].find((n) => n.match?.(path));
  return loose ? loose.labelKey : null;
}

export function BackBar({ path }: { path: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const hist = useSyncExternalStore(subscribe, getStack, () => serverStack);

  useEffect(() => record(path), [path]);

  if (ROOTS.has(path)) return null;
  // The stack may not include this page yet on the first render after navigating.
  const prev = hist[hist.length - 1] === path ? hist[hist.length - 2] : hist[hist.length - 1];
  const target = prev && prev !== path ? prev : parentOf(path);
  const key = labelKeyOf(target.split("?")[0]);
  const label = key ? t(key) : t("common.back");

  return (
    <button
      type="button"
      onClick={() => (prev && prev !== path ? router.back() : router.push(target))}
      className="group mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card/80 py-1.5 ps-2.5 pe-3.5 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur transition-colors hover:border-gold hover:text-foreground"
      aria-label={`${t("common.back")}: ${label}`}
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" aria-hidden />
      {label}
    </button>
  );
}
