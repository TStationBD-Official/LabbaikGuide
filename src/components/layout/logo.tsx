"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";

/** Brand mark: an eight-point star (Rub el Hizb motif) in gold around a Ka'bah square. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--primary)" />
      <g fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="11" y="11" width="18" height="18" />
        <rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" />
      </g>
      <rect x="16" y="16" width="8" height="8" rx="0.8" fill="var(--primary-foreground)" opacity="0.95" />
      <rect x="16" y="18" width="8" height="1.2" fill="var(--gold)" />
    </svg>
  );
}

export function Logo() {
  const { t } = useI18n();
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-xl" aria-label={t("app.name")}>
      <LogoMark className="size-9 shrink-0" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[0.95rem] font-semibold text-foreground">{t("app.name")}</span>
        <span className="truncate text-[0.7rem] text-muted-foreground">{t("app.tagline")}</span>
      </span>
    </Link>
  );
}
