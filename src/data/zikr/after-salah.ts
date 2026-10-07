import type { Zikr } from "@/types/content";
import type { PrayerName } from "@/features/prayer/times";
import { DEFAULT_ZIKR } from "./defaults";

/**
 * Adhkar after the obligatory prayers — only well-established narrations.
 * Ayat al-Kursi is not typed here: it is shown from the Quran text itself
 * (the reader's script and translation, or the official KFGQPC Hafs text offline).
 */
export const AFTER_SALAH_ZIKR: Zikr[] = [
  {
    id: "antas-salam",
    kind: "default",
    name: { bn: "আল্লাহুম্মা আনতাস সালাম", en: "Allahumma antas-salam" },
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    pronunciation: {
      bn: "আল্লা-হুম্মা আনতাস সালা-মু ওয়া মিনকাস সালা-মু, তাবা-রাকতা ইয়া- যাল জালা-লি ওয়াল ইকরা-ম",
      en: "Allāhumma antas-salāmu wa minkas-salāmu, tabārakta yā dhal-jalāli wal-ikrām",
    },
    meaning: {
      bn: "হে আল্লাহ, আপনিই শান্তি, আপনার কাছ থেকেই শান্তি; আপনি বরকতময়, হে মহিমা ও সম্মানের অধিকারী।",
      en: "O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of majesty and honour.",
    },
    target: 1,
    references: [{ label: "Sahih Muslim 591" }],
  },
  {
    id: "tahlil-full",
    kind: "default",
    name: { bn: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু…", en: "La ilaha illallahu wahdahu…" },
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    pronunciation: {
      bn: "লা- ইলা-হা ইল্লাল্লা-হু ওয়াহদাহু লা- শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা- কুল্লি শাইয়িন ক্বাদীর",
      en: "Lā ilāha illā-llāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shayʾin qadīr",
    },
    meaning: {
      bn: "আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই; রাজত্ব তাঁরই, প্রশংসা তাঁরই, আর তিনি সব কিছুর উপর ক্ষমতাবান।",
      en: "There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is able to do all things.",
    },
    target: 1,
    references: [{ label: "Sahih Muslim 597" }],
  },
  {
    id: "ayatul-kursi",
    kind: "default",
    name: { bn: "আয়াতুল কুরসি", en: "Ayat al-Kursi" },
    arabic: "",
    pronunciation: { bn: "সূরা আল-বাকারা ২:২৫৫", en: "Surah al-Baqarah 2:255" },
    meaning: { bn: "", en: "" },
    target: 1,
    references: [{ label: "an-Nasa'i, as-Sunan al-Kubra", detail: "recited after every obligatory prayer" }],
    link: "/quran/surah/2?ayah=255",
    quranVerse: "2:255",
  },
];

/** Every zikr a plan can use (built-in + after-salah); custom zikr are added from the store. */
export const ZIKR_CATALOG: Zikr[] = [...DEFAULT_ZIKR, ...AFTER_SALAH_ZIKR];

export type PlanItem = { zikrId: string; count: number; ref?: string };

/** Sunnah sequence after each obligatory prayer (Muslim 591, 597; an-Nasa'i). */
export const AFTER_SALAH_ITEMS: PlanItem[] = [
  { zikrId: "astaghfirullah", count: 3, ref: "Sahih Muslim 591" },
  { zikrId: "antas-salam", count: 1, ref: "Sahih Muslim 591" },
  { zikrId: "subhanallah", count: 33, ref: "Sahih Muslim 597" },
  { zikrId: "alhamdulillah", count: 33, ref: "Sahih Muslim 597" },
  { zikrId: "allahuakbar", count: 33, ref: "Sahih Muslim 597" },
  { zikrId: "tahlil-full", count: 1, ref: "Sahih Muslim 597" },
  { zikrId: "ayatul-kursi", count: 1, ref: "an-Nasa'i, as-Sunan al-Kubra" },
];

export const SALAH_FOR_PLANS: Exclude<PrayerName, "sunrise">[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/** Default reminder delay after the adhan (minutes) — roughly after iqamah + prayer at the Haramain. */
export const DEFAULT_OFFSET_MIN: Record<Exclude<PrayerName, "sunrise">, number> = {
  fajr: 35,
  dhuhr: 30,
  asr: 30,
  maghrib: 20,
  isha: 30,
};
