"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible switch (role="switch") with an emoji that matches what it controls.
 * Off: a clearly visible neutral track (readable on dark cards too) and a grey emoji.
 * On: the theme colour (follows the chosen accent) and the emoji in full colour.
 * The slide is skipped when "reduce motion" is on (global CSS rule).
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  emoji,
  className,
  compact,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  /** Shown on the knob, e.g. "📳" for vibration. */
  emoji?: string;
  className?: string;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-center justify-between gap-4", compact ? "py-1" : "py-2.5", className)}>
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full outline-offset-2 transition-[background-color,box-shadow] duration-300 [-webkit-tap-highlight-color:transparent]",
          checked
            ? "bg-primary shadow-[0_0_0_1px_var(--primary),0_2px_10px_-2px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
            : "bg-[color-mix(in_oklab,var(--foreground)_16%,var(--card))] shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--foreground)_30%,transparent),inset_0_2px_4px_rgb(0_0_0/0.15)]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 grid size-7 place-items-center rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.35)] transition-[inset-inline-start,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90",
            checked ? "start-[calc(100%-1.875rem)]" : "start-0.5",
          )}
        >
          {emoji ? (
            <span
              className={cn(
                "text-[15px] leading-none transition-[filter,opacity] duration-300 [font-family:'Noto_Color_Emoji','Apple_Color_Emoji','Segoe_UI_Emoji',sans-serif]",
                checked ? "" : "opacity-70 grayscale",
              )}
            >
              {emoji}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}
