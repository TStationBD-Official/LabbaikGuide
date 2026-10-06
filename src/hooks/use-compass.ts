"use client";

import { useCallback, useEffect, useState } from "react";

export type CompassState = "off" | "active" | "unavailable";
type OrientationEventIOS = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * Device compass heading (degrees clockwise from North), where supported.
 * iOS needs `start()` to be called from a user gesture (permission prompt).
 */
export function useCompass() {
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
        // Compensate for landscape orientation so "up" on screen stays the reference.
        const screenAngle = typeof screen !== "undefined" && screen.orientation ? screen.orientation.angle : 0;
        setHeading((h + screenAngle + 360) % 360);
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

