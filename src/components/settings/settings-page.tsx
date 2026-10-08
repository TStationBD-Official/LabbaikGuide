"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { Toggle } from "@/components/ui/toggle";
import { UnavailableNotice } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { AccentSelector, FontSelectors, LanguageSelector, LocationSwitcher, ThemeSelector } from "@/components/layout/selectors";
import { LayerToggles } from "@/components/quran/layer-toggles";
import { clearAllLocalData } from "@/services/storage/idb-storage";
import { HomeClockSettings } from "@/components/home/dual-clock";
import { useNotificationStore, type NotificationMode } from "@/stores/notification-store";
import { APP_CONFIG } from "@/config/app";
import { OfflineSection } from "./offline-section";
import { useConfirm } from "@/components/ui/confirm";

function Section({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <section id={`sec-${id}`} aria-labelledby={id} className="scroll-mt-40 md:scroll-mt-24">
      <h2 id={id} className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-gold">
        {title}
      </h2>
      <Card className="space-y-4 p-4 sm:p-5">{children}</Card>
    </section>
  );
}

const permissionStore = {
  subscribe: (cb: () => void) => {
    const id = setInterval(cb, 2000);
    return () => clearInterval(id);
  },
  get: (): NotificationPermission | "unsupported" =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
};

function Notifications() {
  const { t } = useI18n();
  const mode = useNotificationStore((s) => s.mode);
  const setMode = useNotificationStore((s) => s.setMode);
  const pushState = useNotificationStore((s) => s.pushState);
  const permission = useSyncExternalStore(permissionStore.subscribe, permissionStore.get, () => "default" as const);

  const choose = async (m: NotificationMode) => {
    if (m !== "none" && permission === "default") {
      const r = await Notification.requestPermission(); // only ever on an explicit user choice
      if (r !== "granted") return setMode("none");
    }
    setMode(permission === "denied" ? "none" : m);
  };

  return (
    <>
      <SegmentedControl<NotificationMode>
        label={t("settings.notifications")}
        value={permission === "granted" ? mode : "none"}
        onChange={(m) => void choose(m)}
        options={[
          { value: "all", label: t("settings.notifAll") },
          { value: "prayer", label: t("settings.notifPrayer") },
          { value: "zikr", label: t("settings.notifZikr") },
          { value: "none", label: t("settings.notifNone") },
        ]}
      />
      <p className="text-xs text-muted-foreground">{t("settings.notifDesc")}</p>
      {permission === "granted" && (mode === "all" || mode === "zikr") ? (
        <p className={pushState === "active" ? "text-xs font-medium text-primary" : "text-xs text-muted-foreground"}>
          {pushState === "active" ? t("zikrPlan.pushActive") : pushState === "unsupported" ? t("zikrPlan.pushUnsupported") : t("zikrPlan.pushInApp")}
        </p>
      ) : null}
      {permission === "denied" ? <UnavailableNotice message={t("settings.notifDenied")} /> : null}
      {permission === "unsupported" ? <UnavailableNotice message={t("settings.notifUnsupported")} /> : null}
    </>
  );
}

export function SettingsPage() {
  const { t } = useI18n();
  const confirmDialog = useConfirm();
  const toast = useToast();
  const reducedMotion = usePrefs((s) => s.reducedMotion);
  const setPrefs = usePrefs((s) => s.set);
  const [clearing, setClearing] = useState(false);

  const sections = useMemo(() => [
    { id: "s-appearance", title: t("settings.appearance") },
    { id: "s-language", title: t("settings.language") },
    { id: "s-fonts", title: t("settings.fonts") },
    { id: "s-quran", title: t("settings.quran") },
    { id: "s-clock", title: t("clock.title") },
    { id: "s-location", title: t("settings.location") },
    ...(APP_CONFIG.features.notifications ? [{ id: "s-notif", title: t("settings.notifications") }] : []),
    { id: "s-a11y", title: t("settings.accessibility") },
    { id: "s-offline", title: t("settings.offlineData") },
    { id: "s-about", title: t("settings.about") },
  ], [t]);

  return (
    <div className="xl:grid xl:grid-cols-[13rem_minmax(0,48rem)] xl:items-start xl:justify-center xl:gap-10">
      <SectionIndex sections={sections} />
      <div className="mx-auto max-w-3xl space-y-8 xl:mx-0 xl:max-w-none">
      <Section id="s-appearance" title={t("settings.appearance")}>
        <ThemeSelector />
        <AccentSelector />
      </Section>

      <Section id="s-language" title={t("settings.language")}>
        <LanguageSelector />
      </Section>

      <Section id="s-fonts" title={t("settings.fonts")}>
        <FontSelectors />
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-xs text-muted-foreground">{t("settings.preview")}</p>
          <p className="mt-1">বাংলা লেখার নমুনা — আল্লাহ পবিত্র ও সকল প্রশংসা তাঁর।</p>
          <p lang="ar" dir="rtl" className="font-quran mt-2 text-right">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      </Section>

      <Section id="s-quran" title={t("settings.quran")}>
        <LayerToggles />
      </Section>

      <Section id="s-clock" title={t("clock.title")}>
        <HomeClockSettings />
      </Section>

      <Section id="s-location" title={t("settings.location")}>
        <LocationSwitcher />
      </Section>

      {APP_CONFIG.features.notifications ? (
        <Section id="s-notif" title={t("settings.notifications")}>
          <Notifications />
        </Section>
      ) : null}

      <Section id="s-a11y" title={t("settings.accessibility")}>
        <Toggle
          label={t("settings.reducedMotion")}
          description={t("settings.reducedMotionDesc")}
          checked={reducedMotion}
          onChange={(v) => setPrefs({ reducedMotion: v })}
        />
      </Section>

      <Section id="s-offline" title={t("settings.offlineData")}>
        <OfflineSection />
        <div className="gold-rule" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("settings.clearDataDesc")}</p>
        <Button
          variant="outline"
          className="border-danger/40 text-danger"
          disabled={clearing}
          onClick={async () => {
            const ok = await confirmDialog({
              emoji: "⚠️",
              title: t("confirm.clearAllTitle"),
              message: t("confirm.clearAllMsg"),
              confirmLabel: t("confirm.clearAllOk"),
            });
            if (!ok) return;
            setClearing(true);
            await clearAllLocalData();
            toast(t("settings.clearDataDone"));
            window.location.reload();
          }}
        >
          <Trash2 className="size-4" aria-hidden />
          {t("settings.clearData")}
        </Button>
      </Section>

      <Section id="s-about" title={t("settings.about")}>
        <p className="text-sm">{t("settings.aboutText")}</p>
        <nav className="divide-y divide-border rounded-xl border border-border">
          {[
            { href: "/about", label: t("about.title") },
            { href: "/sources", label: t("nav.sources") },
            { href: "/privacy", label: t("nav.privacy") },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-12 items-center justify-between px-4 text-sm hover:bg-muted">
              {l.label}
              <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden />
            </Link>
          ))}
        </nav>
      </Section>
      </div>
    </div>
  );
}

/** Wide screens: sticky list of settings sections that follows the scroll position. */
function SectionIndex({ sections }: { sections: { id: string; title: string }[] }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(sections[0]?.id);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id.replace(/^sec-/, ""));
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(`sec-${s.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav aria-label={t("settings.title")} className="sticky top-[4.75rem] hidden xl:block">
      <ul className="space-y-0.5 border-s border-border">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#sec-${s.id}`}
              aria-current={current === s.id ? "true" : undefined}
              className={cn(
                "-ms-px block border-s-2 py-1.5 ps-4 text-sm transition-colors",
                current === s.id ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
