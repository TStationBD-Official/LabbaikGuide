"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { lockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  title: string;
  message?: string;
  /** Shown large in a soft circle above the title. */
  emoji?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for deleting or erasing, "primary" for anything else. */
  tone?: "danger" | "primary";
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const fallbackConfirm = async (o: ConfirmOptions) => typeof window !== "undefined" && window.confirm(o.title);

const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

/** `const confirm = useConfirm(); if (await confirm({...})) …` — replaces window.confirm. */
export function useConfirm() {
  // Outside the provider (isolated tests) fall back to the browser dialog.
  return useContext(ConfirmContext) ?? fallbackConfirm;
}

/**
 * App-wide confirmation dialog: native <dialog> (focus trap, Esc, top layer —
 * so it also opens above other sheets), animated card with emoji, title,
 * message and two buttons. Cancel is focused first so Enter never erases data
 * by accident. The page behind does not scroll while it is open.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const queue = useRef<Pending[]>([]);

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        const item = { ...o, resolve };
        setPending((cur) => {
          if (cur) {
            queue.current.push(item);
            return cur;
          }
          return item;
        });
      }),
    [],
  );

  const settle = useCallback((ok: boolean) => {
    setPending((cur) => {
      cur?.resolve(ok);
      return queue.current.shift() ?? null;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog pending={pending} onSettle={settle} />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ pending, onSettle }: { pending: Pending | null; onSettle: (ok: boolean) => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const open = Boolean(pending);
  // Keep the last content while the closing animation plays.
  const [shown, setShown] = useState<Pending | null>(pending);
  if (pending && pending !== shown) setShown(pending);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => cancelRef.current?.focus());
    }
  }, [open]);

  useEffect(() => (open ? lockScroll() : undefined), [open]);

  const danger = (shown?.tone ?? "danger") === "danger";

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby={shown?.message ? "confirm-message" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onSettle(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) onSettle(false); // backdrop
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent open:flex open:items-end sm:open:items-center sm:open:justify-center"
    >
      <AnimatePresence
        onExitComplete={() => {
          ref.current?.close();
          setShown(null);
        }}
      >
        {open && shown ? (
          <>
            <motion.div
              key="backdrop"
              aria-hidden
              className="pointer-events-none fixed inset-0 bg-black/50 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
            />
            <motion.div
              key="card"
              role="document"
              className="relative w-full overflow-hidden rounded-t-3xl border border-border bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center text-card-foreground shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)] sm:mx-4 sm:max-w-sm sm:rounded-3xl sm:pb-5"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 460, damping: 34 }}
            >
              <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60", danger ? "bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--danger)_22%,transparent),transparent)]" : "bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--gold)_28%,transparent),transparent)]")} />
              {shown.emoji ? (
                <motion.div
                  aria-hidden
                  className={cn(
                    "relative mx-auto grid size-16 place-items-center rounded-full text-3xl ring-8",
                    danger ? "bg-danger/10 ring-danger/5" : "bg-gold-soft ring-gold/10",
                  )}
                  initial={reduce ? false : { scale: 0.5, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.05 }}
                >
                  {shown.emoji}
                </motion.div>
              ) : null}
              <h2 id="confirm-title" className="relative mt-4 text-lg font-semibold leading-snug">
                {shown.title}
              </h2>
              {shown.message ? (
                <p id="confirm-message" className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {shown.message}
                </p>
              ) : null}
              <div className="relative mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                <Button ref={cancelRef} variant="outline" className="w-full sm:flex-1" onClick={() => onSettle(false)}>
                  {shown.cancelLabel ?? t("confirm.cancel")}
                </Button>
                <Button variant={danger ? "danger" : "primary"} className="w-full sm:flex-1" onClick={() => onSettle(true)}>
                  {shown.confirmLabel ?? t("confirm.ok")}
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
