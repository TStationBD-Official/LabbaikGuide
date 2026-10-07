"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { lockScroll } from "@/lib/scroll-lock";
import { useI18n } from "@/components/providers/i18n-provider";

/**
 * Modal built on native <dialog>: focus trapping, Esc to close, top-layer
 * stacking and inert background for free. Renders as a bottom sheet on
 * phones and a centred modal on larger screens.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // The page behind must not scroll while the sheet is open.
  useEffect(() => (open ? lockScroll() : undefined), [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // backdrop click
      }}
      aria-labelledby="sheet-title"
      className={cn(
        "m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-3xl border border-border bg-card p-0 text-card-foreground shadow-soft",
        "backdrop:bg-black/45 backdrop:backdrop-blur-[2px]",
        "sm:m-auto sm:max-w-lg sm:rounded-3xl",
        "open:animate-[sheet-in_220ms_ease-out]",
        className,
      )}
    >
      <div className="flex max-h-[88dvh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 id="sheet-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="grid size-10 place-items-center rounded-full hover:bg-muted"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-4 safe-bottom">{children}</div>
      </div>
    </dialog>
  );
}
