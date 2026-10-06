import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card text-card-foreground shadow-soft", className)}
      {...props}
    />
  );
}

/** Frosted card used over the patterned backdrop. */
export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl border border-border/70 text-card-foreground shadow-soft",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  action,
  as: Tag = "h2",
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2", className)}>
      <Tag className="flex min-w-0 items-center gap-2 text-lg font-semibold text-foreground">
        <span aria-hidden className="inline-block h-4 w-1 rounded-full bg-gold" />
        {title}
      </Tag>
      {action}
    </div>
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "gold" | "primary" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    gold: "bg-gold-soft text-gold",
    primary: "bg-primary-soft text-primary",
    warning: "bg-gold-soft text-warning",
    danger: "bg-danger/10 text-danger",
  } as const;
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}

/** Page title with ornamental gold rule. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="gold-rule mt-4" aria-hidden />
    </header>
  );
}
