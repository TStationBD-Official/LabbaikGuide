"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Keep the screen on while navigating (Screen Wake Lock API, where supported). */
export function useWakeLock() {
  const [active, setActive] = useState(false);
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const lock = useRef<WakeLockSentinel | null>(null);
  const wanted = useRef(false);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      lock.current = await navigator.wakeLock.request("screen");
      setActive(true);
      lock.current.addEventListener("release", () => setActive(false));
    } catch {
      setActive(false);
    }
  }, [supported]);

  const enable = useCallback(async () => {
    wanted.current = true;
    await acquire();
  }, [acquire]);

  const disable = useCallback(async () => {
    wanted.current = false;
    await lock.current?.release().catch(() => {});
    lock.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    // The lock is released when the page is hidden; take it back on return.
    const onVis = () => {
      if (document.visibilityState === "visible" && wanted.current) acquire();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock.current?.release().catch(() => {});
    };
  }, [acquire]);

  return { supported, active, enable, disable };
}
