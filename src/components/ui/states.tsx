"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, WifiOff } from "lucide-react";
import { errorMessageKey } from "@/services/api-client";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-xl", className)} />;
}

export function SkeletonList({ rows = 4, className }: { rows?: number; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label={t("common.loading")}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const key = errorMessageKey(error);
  const Icon = key === "errors.offlineNoCache" || key === "errors.network" ? WifiOff : AlertTriangle;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/70 p-6 text-center",
        className,
      )}
    >
      <Icon aria-hidden className="size-8 text-warning" />
      <p className="text-sm text-foreground">{t(key)}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden className="size-4" />
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message, icon, action }: { message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
      {icon ?? <Inbox aria-hidden className="size-8 text-muted-foreground" />}
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

/** Banner for live data that could not be confirmed. Never replaced with guesses. */
export function UnavailableNotice({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-xl border border-warning/30 bg-gold-soft/60 px-3 py-2.5 text-sm text-foreground",
        className,
      )}
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
      <span>{message}</span>
    </div>
  );
}
