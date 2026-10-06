"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Ripple = { id: number; x: number; y: number };

const PARTICLES = 14;

/**
 * Large tappable counter circle with tactile animation:
 *  - press-in spring while the finger is down, bounce back on release
 *  - gold ripple + soft glow from the exact touch point (clipped to the circle)
 *  - a brief ring flash on every count
 *  - a sparkle burst around the circle when `burst` changes (target reached)
 * Counting happens on pointer-down for instant response; keyboard and
 * assistive-tech activation are supported. Honors prefers-reduced-motion.
 */
export function TapCircle({
  onTap,
  label,
  burst,
  pulse,
  children,
  className,
}: {
  onTap: () => void;
  label: string;
  /** Change this value to fire the sparkle burst. */
  burst: number;
  /** Change this value on every counted tap (drives the ring flash). */
  pulse: number;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(130);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Measure the circle so sparkles fly just beyond its edge at any size.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRadius(el.offsetWidth / 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ripple = (x: number, y: number) => {
    if (reduce) return;
    const id = performance.now() + Math.random();
    setRipples((r) => [...r.slice(-5), { id, x, y }]);
    timers.current.push(setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 750));
  };

  return (
    <div ref={box} className={`relative ${className ?? ""}`}>
      {/* Sparkle burst (outside the clipped circle) */}
      <AnimatePresence>
        {burst > 0 && !reduce ? (
          <motion.div key={burst} aria-hidden className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.75, duration: 0.3 }}>
            {Array.from({ length: PARTICLES }, (_, i) => {
              const a = (i / PARTICLES) * Math.PI * 2;
              const dist = radius + 10 + (i % 3) * 12; // px, just beyond the ring
              return (
                <motion.span
                  key={i}
                  className="absolute top-1/2 left-1/2 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]"
                  style={{ width: i % 2 ? 6 : 9, height: i % 2 ? 6 : 9, marginLeft: i % 2 ? -3 : -4.5, marginTop: i % 2 ? -3 : -4.5 }}
                  initial={{ x: Math.cos(a) * radius * 0.82, y: Math.sin(a) * radius * 0.82, scale: 0.4, opacity: 0 }}
                  animate={{ x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: [0.4, 1.2, 0.6], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={label}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 520, damping: 18, mass: 0.6 }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          ripple(e.clientX - rect.left, e.clientY - rect.top);
          onTap();
        }}
        onClick={(e) => {
          // Assistive tech activates with a synthetic click (detail === 0) and no pointer event.
          if (e.detail === 0) onTap();
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (!e.repeat) {
              const rect = e.currentTarget.getBoundingClientRect();
              ripple(rect.width / 2, rect.height / 2);
              onTap();
            }
          }
        }}
        className="relative block touch-manipulation select-none overflow-hidden rounded-full outline-offset-4 [-webkit-tap-highlight-color:transparent]"
        style={{ WebkitTouchCallout: "none" }}
      >
        {children}

        {/* Ring flash on each count */}
        <AnimatePresence>
          {pulse > 0 && !reduce ? (
            <motion.span
              key={pulse}
              aria-hidden
              className="pointer-events-none absolute inset-2 rounded-full border-4 border-gold/70"
              initial={{ opacity: 0.85, scale: 0.97 }}
              animate={{ opacity: 0, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          ) : null}
        </AnimatePresence>

        {/* Touch ripples */}
        {ripples.map((r) => (
          <span key={r.id} aria-hidden className="pointer-events-none absolute" style={{ left: r.x, top: r.y }}>
            <motion.span
              className="absolute -top-20 -left-20 size-40 rounded-full bg-[radial-gradient(circle,var(--gold)_0%,transparent_65%)]"
              initial={{ scale: 0.2, opacity: 0.45 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
            />
            <motion.span
              className="absolute -top-12 -left-12 size-24 rounded-full border-2 border-gold/70"
              initial={{ scale: 0.15, opacity: 0.9 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          </span>
        ))}
      </motion.button>
    </div>
  );
}
