"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import { AFTER_SALAH_ITEMS, DEFAULT_OFFSET_MIN, SALAH_FOR_PLANS, type PlanItem } from "@/data/zikr/after-salah";
import type { PrayerName } from "@/features/prayer/times";
import { uid } from "@/lib/utils";

export type SalahName = Exclude<PrayerName, "sunrise">;
export type PlanTrigger = { type: "salah"; salah: SalahName[]; offsetMin: number } | { type: "time"; time: string /* HH:MM, Makkah time */ };

export type ZikrPlan = {
  id: string;
  /** Built-in after-salah plans keep their id ("salah-fajr" …) and cannot be deleted. */
  builtIn: boolean;
  /** Custom name (built-ins are named from the salah). */
  name?: string;
  trigger: PlanTrigger;
  items: PlanItem[];
  remind: boolean;
};

export type PlanProgress = { step: number; count: number; done: boolean; updated: number };

export const MAX_ITEMS = 30;
export const MAX_PLANS = 20;
const MAX_COUNT = 10_000;

export const builtInPlan = (s: SalahName): ZikrPlan => ({
  id: `salah-${s}`,
  builtIn: true,
  trigger: { type: "salah", salah: [s], offsetMin: DEFAULT_OFFSET_MIN[s] },
  items: AFTER_SALAH_ITEMS.map((i) => ({ ...i })),
  remind: true,
});

const DEFAULT_PLANS = SALAH_FOR_PLANS.map(builtInPlan);

export const progressKey = (planId: string, day: string) => `${planId}|${day}`;

const sanitizeItems = (items: PlanItem[]) =>
  items
    .filter((i) => i.zikrId && Number.isFinite(i.count))
    .slice(0, MAX_ITEMS)
    .map((i) => ({ ...i, count: Math.min(MAX_COUNT, Math.max(1, Math.round(i.count))) }));

const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

type State = {
  plans: ZikrPlan[];
  progress: Record<string, PlanProgress>;
  savePlan: (p: Omit<ZikrPlan, "id" | "builtIn"> & { id?: string }) => string;
  deletePlan: (id: string) => void;
  resetBuiltIn: (id: string) => void;
  setRemind: (id: string, remind: boolean) => void;
  /** One tap on the current step; returns what happened so the UI can react. */
  tap: (planId: string, day: string) => "counted" | "step-done" | "plan-done" | "ignored";
  back: (planId: string, day: string) => void;
  skip: (planId: string, day: string) => void;
  restart: (planId: string, day: string) => void;
  undoTap: (planId: string, day: string) => void;
};

export const usePlanStore = create<State>()(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      progress: {},

      savePlan: (p) => {
        const items = sanitizeItems(p.items);
        if (!items.length) throw new Error("empty plan");
        if (p.trigger.type === "time" && !validTime(p.trigger.time)) throw new Error("bad time");
        const trigger: PlanTrigger =
          p.trigger.type === "salah"
            ? { type: "salah", salah: p.trigger.salah.filter((s) => SALAH_FOR_PLANS.includes(s)), offsetMin: Math.min(180, Math.max(0, Math.round(p.trigger.offsetMin))) }
            : p.trigger;
        const existing = p.id ? get().plans.find((x) => x.id === p.id) : undefined;
        const id = existing?.id ?? `plan-${uid()}`;
        const plan: ZikrPlan = {
          id,
          builtIn: existing?.builtIn ?? false,
          name: existing?.builtIn ? undefined : (p.name ?? "").trim().slice(0, 60) || undefined,
          trigger: existing?.builtIn && existing.trigger.type === "salah" ? { ...existing.trigger, offsetMin: trigger.type === "salah" ? trigger.offsetMin : existing.trigger.offsetMin } : trigger,
          items,
          remind: p.remind,
        };
        set((s) => ({
          plans: existing ? s.plans.map((x) => (x.id === id ? plan : x)) : [...s.plans, plan].slice(0, MAX_PLANS + SALAH_FOR_PLANS.length),
          // Editing a plan restarts today's progress for it.
          progress: Object.fromEntries(Object.entries(s.progress).filter(([k]) => !k.startsWith(`${id}|`))),
        }));
        return id;
      },

      deletePlan: (id) =>
        set((s) => ({
          plans: s.plans.filter((p) => p.id !== id || p.builtIn),
          progress: Object.fromEntries(Object.entries(s.progress).filter(([k]) => !k.startsWith(`${id}|`))),
        })),

      resetBuiltIn: (id) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id && p.builtIn && p.trigger.type === "salah" ? builtInPlan(p.trigger.salah[0]) : p)),
        })),

      setRemind: (id, remind) => set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...p, remind } : p)) })),

      tap: (planId, day) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return "ignored";
        const key = progressKey(planId, day);
        const cur = get().progress[key] ?? { step: 0, count: 0, done: false, updated: 0 };
        if (cur.done) return "ignored";
        const item = plan.items[cur.step];
        if (!item) return "ignored";
        const count = cur.count + 1;
        let next: PlanProgress = { ...cur, count, updated: Date.now() };
        let result: "counted" | "step-done" | "plan-done" = "counted";
        if (count >= item.count) {
          if (cur.step + 1 >= plan.items.length) {
            next = { step: cur.step, count, done: true, updated: Date.now() };
            result = "plan-done";
          } else result = "step-done";
        }
        set((s) => ({ progress: prune({ ...s.progress, [key]: next }) }));
        return result;
      },

      /** Move to the next step (called after the "step done" pause). */
      skip: (planId, day) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;
        const key = progressKey(planId, day);
        const cur = get().progress[key] ?? { step: 0, count: 0, done: false, updated: 0 };
        const last = cur.step + 1 >= plan.items.length;
        set((s) => ({
          progress: { ...s.progress, [key]: last ? { ...cur, done: true, updated: Date.now() } : { step: cur.step + 1, count: 0, done: false, updated: Date.now() } },
        }));
      },

      back: (planId, day) => {
        const key = progressKey(planId, day);
        const cur = get().progress[key];
        if (!cur) return;
        set((s) => ({ progress: { ...s.progress, [key]: { step: Math.max(0, cur.done ? cur.step : cur.step - 1), count: 0, done: false, updated: Date.now() } } }));
      },

      undoTap: (planId, day) => {
        const key = progressKey(planId, day);
        const cur = get().progress[key];
        if (!cur || cur.count === 0) return;
        set((s) => ({ progress: { ...s.progress, [key]: { ...cur, count: cur.count - 1, done: false, updated: Date.now() } } }));
      },

      restart: (planId, day) => {
        const key = progressKey(planId, day);
        set((s) => ({ progress: { ...s.progress, [key]: { step: 0, count: 0, done: false, updated: Date.now() } } }));
      },
    }),
    {
      name: "hc-zikr-plans",
      storage: idbJSONStorage,
      version: 1,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const plans = p.plans?.length ? p.plans : current.plans;
        // Make sure all five built-in plans exist (e.g. after an update).
        const ids = new Set(plans.map((x) => x.id));
        const missing = DEFAULT_PLANS.filter((d) => !ids.has(d.id));
        return { ...current, ...p, plans: [...missing, ...plans] };
      },
    },
  ),
);

/** Keep only the last 7 days of progress. */
function prune(progress: Record<string, PlanProgress>) {
  const cutoff = Date.now() - 7 * 86_400_000;
  return Object.fromEntries(Object.entries(progress).filter(([, v]) => v.updated >= cutoff));
}
