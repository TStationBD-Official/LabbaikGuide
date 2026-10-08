"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers/preferences-provider";

/**
 * Gentle 3D tilt for a card. Writes --px / --py (−1…1) on the element, used for
 * the rotation, the moving shine and the parallax layers inside.
 * Phones: the gyroscope (slowly re-centred, so any holding angle is "flat").
 * Computers: the mouse over the card. Only runs while the card is on screen;
 * off with "reduce motion" (app setting or system).
 */
export function useTilt<T extends HTMLElement>() {
  // Callback ref: the card may mount after a loading skeleton.
  const [el, setEl] = useState<T | null>(null);
  const reduced = usePrefs((s) => s.reducedMotion);

  useEffect(() => {
    if (!el) return;
    const sys = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sys) {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      return;
    }
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, visible = false;
    let base: { b: number; g: number } | null = null;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null || !visible) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      // drift the neutral position toward how the phone is being held
      base.b += (e.beta - base.b) * 0.01;
      base.g += (e.gamma - base.g) * 0.01;
      tx = clamp((e.gamma - base.g) / 14);
      ty = clamp((e.beta - base.b) / 14);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (!visible) onLeave();
    });
    io.observe(el);
    window.addEventListener("deviceorientation", onOrient);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      window.removeEventListener("deviceorientation", onOrient);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [el, reduced]);

  return setEl;
}
