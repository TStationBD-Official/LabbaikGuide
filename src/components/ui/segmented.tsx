"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: string; icon?: React.ReactNode };

/**
 * Segmented control implemented as a radiogroup with roving focus
 * (arrow keys move selection, RTL-aware).
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasSelection = options.some((o) => o.value === value);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const idx = options.findIndex((o) => o.value === value);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let next = idx;
    if (e.key === fwd || e.key === "ArrowDown") next = (idx + 1) % options.length;
    else if (e.key === back || e.key === "ArrowUp") next = (idx - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={`${id}-l`}
      onKeyDown={onKey}
      className={cn("flex w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1 no-scrollbar", className)}
    >
      <span id={`${id}-l`} className="sr-only">
        {label}
      </span>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!hasSelection && i === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors",
              size === "sm" ? "min-h-8 px-2.5 text-xs" : "min-h-10 px-3 text-sm",
              selected ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
