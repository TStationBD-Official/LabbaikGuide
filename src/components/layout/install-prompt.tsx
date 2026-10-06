"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hc-install-dismissed-at";
const VISIT_KEY = "hc-visits";
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 14;

/**
 * Non-aggressive install prompt: only after the 3rd visit, only when the browser
 * offers installation, and snoozed for 14 days once dismissed.
 */
export function InstallPrompt() {
  const { t } = useI18n();
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let eligible = false;
    try {
      const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
      localStorage.setItem(VISIT_KEY, String(visits));
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      eligible = visits >= 3 && Date.now() - dismissedAt > SNOOZE_MS;
    } catch {
      eligible = false;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (eligible) setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!evt) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setEvt(null);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="glass fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border p-3 shadow-soft lg:bottom-6"
    >
      <Download aria-hidden className="size-6 shrink-0 text-gold" />
      <div className="min-w-0 flex-1">
        <p id="install-title" className="text-sm font-semibold">
          {t("pwa.install")}
        </p>
        <p className="text-xs text-muted-foreground">{t("pwa.installDesc")}</p>
      </div>
      <Button
        size="sm"
        onClick={async () => {
          await evt.prompt();
          await evt.userChoice.catch(() => undefined);
          setEvt(null);
        }}
      >
        {t("pwa.installBtn")}
      </Button>
      <button type="button" onClick={dismiss} aria-label={t("pwa.dismiss")} className="grid size-9 place-items-center rounded-full hover:bg-muted">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
