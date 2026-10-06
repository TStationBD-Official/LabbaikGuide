"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
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
import { useNotificationStore, type NotificationMode } from "@/stores/notification-store";
import { APP_CONFIG } from "@/config/app";
import { OfflineSection } from "./offline-section";

function Section({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id}>
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
      {permission === "denied" ? <UnavailableNotice message={t("settings.notifDenied")} /> : null}
      {permission === "unsupported" ? <UnavailableNotice message={t("settings.notifUnsupported")} /> : null}
    </>
  );
}

export function SettingsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const reducedMotion = usePrefs((s) => s.reducedMotion);
  const setPrefs = usePrefs((s) => s.set);
  const [clearing, setClearing] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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
            if (!window.confirm(t("common.confirm"))) return;
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
  );
}
