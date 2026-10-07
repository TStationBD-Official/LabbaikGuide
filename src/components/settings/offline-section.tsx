"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CloudDownload, Download, Loader2, Trash2, WifiOff, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";
import { UnavailableNotice } from "@/components/ui/states";
import { useResources } from "@/services/quran/queries";
import { cancelDownload, deleteOfflineQuran, downloadQuran, TOTAL_SURAHS, useOfflineQuran } from "@/services/quran/offline";
import { useQuranStore } from "@/stores/quran-store";
import { useOnline } from "@/hooks/use-online";
import { useConfirm } from "@/components/ui/confirm";

/** Whether the service worker has saved the core app pages. */
function useAppOfflineStatus() {
  const [state, setState] = useState<"checking" | "ready" | "saving" | "unsupported">("checking");
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      queueMicrotask(() => setState("unsupported"));
      return;
    }
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "status") setState(e.data.core ? "ready" : "saving");
      if (e.data?.type === "precache-done") navigator.serviceWorker.controller?.postMessage({ type: "status" });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    const ask = () => navigator.serviceWorker.controller?.postMessage({ type: "status" });
    void navigator.serviceWorker.ready.then(ask);
    const id = setInterval(ask, 5000);
    return () => {
      clearInterval(id);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);
  return state;
}

/** Resolves the translation/tafsir the reader would use right now. */
function useCurrentSources() {
  const { locale } = useI18n();
  const translations = useResources("translations", locale);
  const tafsirs = useResources("tafsirs", locale);
  const q = useQuranStore();
  const tr = translations.data?.resources.find((r) => r.id === (q.translationByLang[locale] ?? translations.data?.resources[0]?.id));
  const tf = tafsirs.data?.resources.find((r) => r.id === (q.tafsirByLang[locale] ?? tafsirs.data?.resources[0]?.id));
  return { locale, translation: tr ?? null, tafsir: tf ?? null, loading: translations.isPending };
}

export function OfflineSection() {
  const { t, formatNumber } = useI18n();
  const confirmDialog = useConfirm();
  const app = useAppOfflineStatus();
  const dl = useOfflineQuran();
  const { locale, translation, tafsir, loading } = useCurrentSources();
  const [withTafsir, setWithTafsir] = useState(false);
  const online = useOnline();

  useEffect(() => {
    void useOfflineQuran.getState().refresh();
  }, []);

  const meta = dl.meta;
  const complete = meta && meta.surahs.length === TOTAL_SURAHS;
  const mismatch = meta && (meta.lang !== locale || (translation && meta.translationId !== translation.id));
  const running = dl.status === "running";
  const partial = meta && !complete && !running;

  const start = () =>
    void downloadQuran({
      lang: locale,
      translationId: translation?.id ?? null,
      translationName: translation?.name ?? null,
      tafsirId: withTafsir ? (tafsir?.id ?? null) : null,
      tafsirName: withTafsir ? (tafsir?.name ?? null) : null,
    });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 text-sm">
        {app === "ready" ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        ) : app === "unsupported" ? (
          <WifiOff className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        ) : (
          <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        )}
        <p role="status">
          {app === "ready" ? t("offline.appReady") : app === "unsupported" ? t("offline.appUnsupported") : t("offline.appSaving")}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <CloudDownload className="size-5 text-gold" aria-hidden />
          {t("offline.quranTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("offline.quranDesc")}</p>

        {meta ? (
          <div className="space-y-1 text-sm">
            <p>{t("offline.status", { surahs: meta.surahs.length, translation: meta.translationName ?? "—" })}</p>
            {meta.tafsirId ? <p>{t("offline.statusTafsir", { surahs: meta.tafsirSurahs.length, name: meta.tafsirName ?? "" })}</p> : null}
          </div>
        ) : null}
        {mismatch && !running ? <UnavailableNotice message={t("offline.mismatch")} /> : null}

        {running ? (
          <div className="space-y-2" aria-live="polite">
            <p className="text-sm font-medium">
              {dl.phase === "tafsir" ? t("offline.phaseTafsir") : dl.phase === "pages" ? t("offline.phasePages") : t("offline.phaseText")}{" "}
              <span className="text-muted-foreground">{t("offline.progress", { done: formatNumber(dl.done), total: formatNumber(dl.total) })}</span>
            </p>
            <Progress value={dl.done} max={dl.total} label={t("offline.quranTitle")} />
            <Button variant="outline" size="sm" onClick={cancelDownload}>
              <X className="size-4" aria-hidden />
              {t("offline.cancel")}
            </Button>
          </div>
        ) : (
          <>
            {tafsir ? (
              <Toggle compact label={t("offline.includeTafsir", { name: tafsir.name })} description={t("offline.tafsirNote")} checked={withTafsir} onChange={setWithTafsir} />
            ) : null}
            {dl.status === "done" && complete && !mismatch ? (
              <p className="flex items-center gap-2 text-sm font-medium text-success" role="status">
                <CheckCircle2 className="size-4" aria-hidden />
                {t("offline.done")}
              </p>
            ) : null}
            {dl.status === "error" ? <UnavailableNotice message={t("offline.error")} /> : null}
            <div className="flex flex-wrap gap-2">
              {!complete || mismatch || (withTafsir && meta?.tafsirId !== tafsir?.id) ? (
                <Button onClick={start} disabled={loading || !online}>
                  <Download className="size-4" aria-hidden />
                  {partial && !mismatch ? t("offline.resume") : t("offline.download")}
                </Button>
              ) : null}
              {meta ? (
                <Button
                  variant="outline"
                  className="border-danger/40 text-danger"
                  onClick={async () => {
                    const ok = await confirmDialog({
                      emoji: "📥",
                      title: t("confirm.offlineTitle"),
                      message: t("confirm.offlineMsg"),
                      confirmLabel: t("confirm.offlineOk"),
                    });
                    if (ok) void deleteOfflineQuran();
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("offline.remove")}
                </Button>
              ) : null}
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground">{t("offline.notIncluded")}</p>
      </div>
    </div>
  );
}

/** Small prompt on the Quran page when the Quran is not yet saved for offline. */
export function OfflineQuranBanner() {
  const { t } = useI18n();
  const meta = useOfflineQuran((s) => s.meta);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    void useOfflineQuran.getState().refresh().then(() => setChecked(true));
  }, []);
  if (!checked || (meta && meta.surahs.length === TOTAL_SURAHS)) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 text-sm">
      <span className="flex items-center gap-2">
        <CloudDownload className="size-4 shrink-0 text-gold" aria-hidden />
        {t("offline.banner")}
      </span>
      <Link href="/settings#s-offline" className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
        {t("offline.bannerAction")}
      </Link>
    </div>
  );
}
