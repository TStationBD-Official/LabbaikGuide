"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Compass, LocateFixed } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented";
import { UnavailableNotice } from "@/components/ui/states";
import { LOCATIONS } from "@/config/locations";
import { angleDiff, distanceToKaabaKm, qiblaBearing } from "@/features/prayer/qibla";
import { cn, vibrate } from "@/lib/utils";

type Origin = { kind: "makkah" | "madinah" | "device"; lat: number; lon: number };
type GeoState = "idle" | "locating" | "denied" | "unsupported";
type CompassState = "off" | "active" | "unavailable";

type OrientationEventIOS = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/** Device compass heading (degrees from North), where supported. */
function useCompass() {
  const [state, setState] = useState<CompassState>("off");
  const [heading, setHeading] = useState<number | null>(null);

  const start = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return setState("unavailable");
    const Ctor = DeviceOrientationEvent as OrientationCtor;
    try {
      if (typeof Ctor.requestPermission === "function") {
        const r = await Ctor.requestPermission(); // iOS 13+: must be from a user gesture
        if (r !== "granted") return setState("unavailable");
      }
    } catch {
      return setState("unavailable");
    }
    setState("active");
  }, []);

  useEffect(() => {
    if (state !== "active") return;
    let got = false;
    const onOrient = (e: Event) => {
      const ev = e as OrientationEventIOS;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") h = ev.webkitCompassHeading;
      else if (ev.absolute && typeof ev.alpha === "number") h = (360 - ev.alpha) % 360;
      if (h !== null) {
        got = true;
        setHeading(h);
      }
    };
    const evName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(evName, onOrient, true);
    const timer = setTimeout(() => {
      if (!got) setState("unavailable"); // desktop or sensor without absolute heading
    }, 2500);
    return () => {
      window.removeEventListener(evName, onOrient, true);
      clearTimeout(timer);
    };
  }, [state]);

  return { state, heading, start };
}

export function QiblaView() {
  const { t, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const [origin, setOrigin] = useState<Origin>({ kind: "madinah", lat: LOCATIONS.madinah.latitude, lon: LOCATIONS.madinah.longitude });
  const [geo, setGeo] = useState<GeoState>("idle");
  const compass = useCompass();

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeo("unsupported");
    setGeo("locating");
    // Location is processed only on this device — never sent to any server.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ kind: "device", lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeo("idle");
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "unsupported"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60_000 },
    );
  };

  const bearing = qiblaBearing(origin.lat, origin.lon);
  const km = distanceToKaabaKm(origin.lat, origin.lon);
  const inHaram = km < 1.5;
  const heading = compass.state === "active" ? compass.heading : null;
  const relative = heading !== null ? (bearing - heading + 360) % 360 : bearing;
  const aligned = heading !== null && Math.abs(angleDiff(heading, bearing)) < 5;

  useEffect(() => {
    if (aligned) vibrate(30);
  }, [aligned]);

  const cityName = origin.kind === "device" ? t("qibla.useLocation") : t(LOCATIONS[origin.kind].nameKey);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="glass flex flex-col items-center p-6">
        <div className="relative aspect-square w-full max-w-[19rem]">
          {/* Dial rotates opposite to the phone heading so N stays north. */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: heading !== null ? -heading : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 18 }}
            aria-hidden
          >
            <svg viewBox="0 0 200 200" className="size-full">
              <circle cx="100" cy="100" r="96" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--gold)" strokeOpacity="0.35" strokeDasharray="1 5" />
              {Array.from({ length: 72 }, (_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1="6"
                  x2="100"
                  y2={i % 18 === 0 ? 18 : i % 2 === 0 ? 13 : 10}
                  stroke="var(--muted-foreground)"
                  strokeOpacity={i % 18 === 0 ? 0.9 : 0.4}
                  strokeWidth={i % 18 === 0 ? 2 : 1}
                  transform={`rotate(${i * 5} 100 100)`}
                />
              ))}
              {["N", "E", "S", "W"].map((d, i) => (
                <text
                  key={d}
                  x="100"
                  y="34"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill={d === "N" ? "var(--danger)" : "var(--muted-foreground)"}
                  transform={`rotate(${i * 90} 100 100)`}
                >
                  {d}
                </text>
              ))}
              {/* Qibla marker on the dial at the true bearing */}
              <g transform={`rotate(${bearing} 100 100)`}>
                <line x1="100" y1="100" x2="100" y2="40" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
                <rect x="91" y="26" width="18" height="18" rx="2" fill="var(--secondary)" stroke="var(--gold)" strokeWidth="2" />
                <rect x="91" y="31" width="18" height="2.5" fill="var(--gold)" />
              </g>
              <circle cx="100" cy="100" r="6" fill="var(--gold)" />
            </svg>
          </motion.div>
          {/* Fixed pointer = the top of the phone */}
          <div aria-hidden className="absolute start-1/2 top-0 h-5 w-1 -translate-x-1/2 rounded-full bg-primary rtl:translate-x-1/2" />
        </div>

        <p className="mt-4 text-3xl font-bold tabular-nums" aria-live="polite">
          {formatNumber(Math.round(bearing))}°
        </p>
        <p className="text-sm text-muted-foreground">{t("qibla.bearing", { deg: formatNumber(Math.round(bearing)) })}</p>
        {heading !== null ? (
          <p className={cn("mt-2 rounded-full px-3 py-1 text-sm font-medium", aligned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")} role="status">
            {aligned ? `✓ ${t("qibla.aligned")}` : `${formatNumber(Math.round(relative))}°`}
          </p>
        ) : null}
      </Card>

      <div className="space-y-4">
        {inHaram ? <UnavailableNotice message={t("qibla.inHaram")} /> : null}
        <Card className="space-y-4 p-4">
          <p className="text-sm font-medium">{t("qibla.fromCity", { city: cityName })}</p>
          <SegmentedControl<"makkah" | "madinah">
            label={t("location.label")}
            value={origin.kind === "device" ? ("" as "makkah") : origin.kind}
            onChange={(k) => setOrigin({ kind: k, lat: LOCATIONS[k].latitude, lon: LOCATIONS[k].longitude })}
            options={[
              { value: "makkah", label: `🕋 ${t("location.makkah")}` },
              { value: "madinah", label: `🕌 ${t("location.madinah")}` },
            ]}
          />
          <Button variant="outline" className="w-full" onClick={locate} disabled={geo === "locating"}>
            <LocateFixed className="size-4" aria-hidden />
            {geo === "locating" ? t("qibla.locating") : t("qibla.useLocation")}
          </Button>
          {geo === "denied" ? <UnavailableNotice message={t("qibla.denied")} /> : null}
          {geo === "unsupported" ? <UnavailableNotice message={t("qibla.unsupported")} /> : null}
          <p className="text-sm text-muted-foreground">{t("qibla.distance", { km: formatNumber(Math.round(km)) })}</p>
          <p className="text-xs text-muted-foreground">{t("qibla.privacy")}</p>
        </Card>
        <Card className="space-y-3 p-4">
          {compass.state === "off" ? (
            <Button className="w-full" onClick={compass.start}>
              <Compass className="size-4" aria-hidden />
              {t("qibla.enableCompass")}
            </Button>
          ) : compass.state === "active" ? (
            <p className="text-sm">{t("qibla.compassActive")}</p>
          ) : (
            <UnavailableNotice message={t("qibla.compassUnavailable")} />
          )}
          <p className="text-xs text-muted-foreground">{t("qibla.approximate")}</p>
        </Card>
      </div>
    </div>
  );
}
