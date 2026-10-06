import { z } from "zod";

/**
 * Normalized Haramain schedule (spec §59). Imam/muezzin are `null` when not
 * confirmed by an official source — never a placeholder like "Unknown Imam".
 */
export const PrayerEntrySchema = z.object({
  name: z.enum(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]),
  adhan: z.string().datetime().nullable(),
  iqamah: z.string().datetime().nullable(),
  imam: z.string().min(1).nullable(),
  muezzin: z.string().min(1).nullable(),
});

export const HaramainScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.literal("Asia/Riyadh"),
  location: z.enum(["makkah", "madinah"]),
  status: z.enum(["official", "unavailable"]),
  prayers: z.array(PrayerEntrySchema),
  source: z
    .object({
      name: z.string(),
      url: z.string().url().nullable(),
      scheduleDate: z.string().nullable(),
    })
    .nullable(),
  fetchedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type HaramainSchedule = z.infer<typeof HaramainScheduleSchema>;
