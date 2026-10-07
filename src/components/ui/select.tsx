"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export type SelectOption<T> = {
  value: T;
  label: string;
  /** Second line under the label. */
  description?: string;
  /** Options with the same group are listed under one heading (keep them adjacent). */
  group?: string;
  /** Rich preview shown in the list (e.g. a font sample). */
  preview?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props<T> = {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  className?: string;
  hideLabel?: boolean;
  /** Shown when no option matches `value`. */
  placeholder?: string;
  /** Adds a filter box; on by default for long lists. */
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: "sm" | "md";
  /** Extra classes for the trigger button (e.g. a pill style). */
  triggerClassName?: string;
  /** Leading icon in the trigger. */
  icon?: ReactNode;
  /** Wider list than the trigger (desktop popover), in rem. */
  minListWidthRem?: number;
};

const SHEET_MQ = "(max-width: 639px)";
const supportsPopover = () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
const norm = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟۖ-ۭ]/g, "")
    .toLowerCase();

/**
 * Custom select: an accessible combobox + listbox with animation.
 *  - Desktop: popover anchored to the trigger (flips above when there is no room).
 *  - Phones: bottom sheet with a large touch list.
 *  - Keyboard: ↑ ↓ Home End PageUp PageDown, Enter/Space to choose, Esc to close,
 *    type-to-jump; optional filter box for long lists.
 * Rendered in the top layer (Popover API) so it is never clipped by dialogs or
 * overflow, and stays inside the DOM subtree of a modal sheet so it remains usable there.
 */
export function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
  className,
  hideLabel,
  placeholder,
  searchable,
  searchPlaceholder,
  size = "md",
  triggerClassName,
  icon,
  minListWidthRem = 14,
}: Props<T>) {
  const { t } = useI18n();
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [sheet, setSheet] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number; above: boolean } | null>(null);
  const typeahead = useRef({ text: "", at: 0 });

  const withSearch = searchable ?? options.length > 12;
  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!withSearch || !query.trim()) return options;
    const q = norm(query.trim());
    return options.filter((o) => norm(`${o.label} ${o.description ?? ""} ${o.group ?? ""} ${String(o.value).replace(/[_/]/g, " ")}`).includes(q));
  }, [options, query, withSearch]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  const choose = useCallback(
    (o: SelectOption<T> | undefined) => {
      if (!o || o.disabled) return;
      if (o.value !== value) onChange(o.value);
      close();
    },
    [value, onChange, close],
  );

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 6;
    const below = vh - r.bottom - gap - 8;
    const aboveSpace = r.top - gap - 8;
    const above = below < 260 && aboveSpace > below;
    const maxHeight = Math.max(160, Math.min(400, above ? aboveSpace : below));
    const width = Math.min(Math.max(r.width, minListWidthRem * 16), vw - 16);
    const rtl = getComputedStyle(el).direction === "rtl";
    let left = rtl ? r.right - width : r.left;
    left = Math.min(Math.max(8, left), vw - width - 8);
    const top = above ? r.top - gap : r.bottom + gap;
    setPos({ top, left, width, maxHeight, above });
  }, [minListWidthRem]);

  const openList = useCallback(() => {
    const isSheet = window.matchMedia(SHEET_MQ).matches;
    setSheet(isSheet);
    if (!isSheet) place();
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
    setOpen(true);
  }, [options, value, place]);

  // Show in the top layer once mounted.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!open || !el || !supportsPopover()) return;
    try {
      if (!el.matches(":popover-open")) el.showPopover();
    } catch {
      /* already shown or unsupported */
    }
  }, [open, sheet]);

  // Focus, initial scroll, outside clicks, repositioning.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (withSearch && !sheet) searchRef.current?.focus({ preventScroll: true });
      else listRef.current?.focus({ preventScroll: true });
      listRef.current?.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: "center" });
    });
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popRef.current?.contains(t) && !(sheet && t === popRef.current)) return;
      close(false);
    };
    const onMove = () => (sheet ? undefined : place());
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, sheet, withSearch, place, close]);

  // Keep the active option visible.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index='${active}']`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const move = (from: number, step: number) => {
    if (!filtered.length) return -1;
    let i = from;
    for (let n = 0; n < filtered.length; n++) {
      i = Math.min(filtered.length - 1, Math.max(0, i + step));
      if (!filtered[i]?.disabled) return i;
      if ((step > 0 && i === filtered.length - 1) || (step < 0 && i === 0)) break;
    }
    return from;
  };

  const onListKey = (e: ReactKeyboardEvent) => {
    const page = 8;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => move(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => move(a, -1));
        break;
      case "Home":
        if (e.target === searchRef.current) return;
        e.preventDefault();
        setActive(move(-1, 1));
        break;
      case "End":
        if (e.target === searchRef.current) return;
        e.preventDefault();
        setActive(move(filtered.length, -1));
        break;
      case "PageDown":
        e.preventDefault();
        setActive((a) => move(Math.min(filtered.length - 1, a + page - 1), 1));
        break;
      case "PageUp":
        e.preventDefault();
        setActive((a) => move(Math.max(0, a - page + 1), -1));
        break;
      case "Enter":
        e.preventDefault();
        choose(filtered[active]);
        break;
      case " ":
        if (e.target === searchRef.current) return;
        e.preventDefault();
        choose(filtered[active]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // don't also close a surrounding sheet
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        // Type-to-jump when there is no filter box.
        if (!withSearch && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 700 ? e.key : t.text + e.key;
          t.at = now;
          const q = norm(t.text);
          const start = Math.max(0, active);
          const order = [...filtered.keys()].map((k) => (k + start + (t.text.length === 1 ? 1 : 0)) % filtered.length);
          const hit = order.find((k) => !filtered[k].disabled && norm(filtered[k].label).startsWith(q));
          if (hit !== undefined) setActive(hit);
        }
    }
  };

  const onTriggerKey = (e: ReactKeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const panelStyle: CSSProperties | undefined =
    !sheet && pos
      ? {
          position: "fixed",
          inset: "auto",
          margin: 0,
          top: pos.above ? undefined : pos.top,
          bottom: pos.above ? window.innerHeight - pos.top : undefined,
          left: pos.left,
          width: pos.width,
          maxHeight: pos.maxHeight,
          transformOrigin: pos.above ? "bottom center" : "top center",
        }
      : undefined;

  const list = (
    <>
      {withSearch ? (
        <div className="relative border-b border-border/70 p-2">
          <Search className="pointer-events-none absolute start-4.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              // Highlight the first match while filtering.
              const nq = norm(q.trim());
              setActive(options.filter((o) => !nq || norm(`${o.label} ${o.description ?? ""} ${o.group ?? ""} ${String(o.value).replace(/[_/]/g, " ")}`).includes(nq)).findIndex((o) => !o.disabled));
            }}
            onKeyDown={onListKey}
            placeholder={searchPlaceholder ?? label}
            aria-label={searchPlaceholder ?? label}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
      ) : null}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={labelId}
        aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
        onKeyDown={onListKey}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
      >
        {filtered.length === 0 ? (
          <li role="presentation" className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("common.noResults")}
          </li>
        ) : (
          filtered.map((o, i) => {
            const isSel = o.value === value;
            const showGroup = o.group && o.group !== filtered[i - 1]?.group;
            return (
              <Fragment key={String(o.value)}>
                {showGroup ? (
                  <li role="presentation" className="px-3 pb-1 pt-3 text-[0.7rem] font-semibold uppercase tracking-wider text-gold first:pt-1.5">
                    {o.group}
                  </li>
                ) : null}
                <li
                  id={`${id}-o${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && active !== i && setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 transition-colors",
                    sheet ? "min-h-12 py-2.5" : "min-h-10 py-2",
                    i === active && "bg-muted",
                    isSel && "text-primary",
                    o.disabled && "cursor-not-allowed opacity-45",
                  )}
                >
                  {o.icon ? <span className="shrink-0">{o.icon}</span> : null}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", isSel ? "font-semibold" : "font-medium")}>{o.label}</span>
                    {o.description ? <span className="mt-0.5 block text-xs text-muted-foreground">{o.description}</span> : null}
                    {o.preview ? <span className="mt-1 block">{o.preview}</span> : null}
                  </span>
                  <span className="grid size-5 shrink-0 place-items-center">
                    {isSel ? (
                      <motion.span initial={reduce ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Check className="size-4" aria-hidden />
                      </motion.span>
                    ) : null}
                  </span>
                </li>
              </Fragment>
            );
          })
        )}
      </ul>
    </>
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span id={labelId} className={cn("text-sm font-medium", hideLabel && "sr-only")}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}-value`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKey}
        className={cn(
          "group flex w-full items-center gap-2 rounded-xl border bg-card text-start text-foreground transition-[border-color,box-shadow] outline-none",
          "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40",
          open ? "border-primary ring-2 ring-ring/30" : "border-border",
          size === "sm" ? "h-10 px-3 text-sm" : "h-11 px-3 text-sm",
          triggerClassName,
        )}
      >
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
        <span id={`${id}-value`} className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder ?? "—"}
        </span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180 text-primary")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          sheet ? (
            <motion.div
              key="sheet"
              ref={popRef}
              popover={supportsPopover() ? "manual" : undefined}
              className="hc-select-sheet fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none items-end overflow-hidden border-0 bg-black/40 p-0 backdrop-blur-[2px]"
              style={supportsPopover() ? undefined : { zIndex: 100 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
            >
              <motion.div
                role="dialog"
                aria-labelledby={labelId}
                className="relative flex max-h-[78dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-border bg-card text-card-foreground shadow-2xl"
                initial={reduce ? false : { y: "100%" }}
                animate={{ y: 0 }}
                exit={reduce ? undefined : { y: "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              >
                <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-2">
                  <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-border" />
                  <span className="pt-3 text-base font-semibold">{label}</span>
                  <button type="button" onClick={() => close()} className="mt-2 grid size-9 place-items-center rounded-full hover:bg-muted" aria-label={t("common.close")}>
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))]">{list}</div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="pop"
              ref={popRef}
              popover={supportsPopover() ? "manual" : undefined}
              role="presentation"
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-[0_18px_50px_-12px_rgb(0_0_0/0.35)]"
              style={{ ...panelStyle, ...(supportsPopover() ? null : { zIndex: 100 }) }}
              initial={reduce ? false : { opacity: 0, scale: 0.96, y: pos?.above ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: pos?.above ? 4 : -4 }}
              transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {list}
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </div>
  );
}
