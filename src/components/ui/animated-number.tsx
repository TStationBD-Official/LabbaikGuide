"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Number that rolls when it changes. Screen readers get the plain value. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const { formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const text = formatNumber(value);
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { y: "55%", opacity: 0, scale: 1.12, filter: "blur(2px)" }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduce ? undefined : { y: "-55%", opacity: 0, scale: 0.9 }}
          transition={{ y: { duration: 0.2, ease: "easeOut" }, opacity: { duration: 0.18 }, scale: { type: "spring", stiffness: 420, damping: 16 }, filter: { duration: 0.18 } }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
