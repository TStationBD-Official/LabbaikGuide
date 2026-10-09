import type { GText } from "@/data/guides/travel";

/** Official 24/7 broadcasts from the Haramain (Saudi Broadcasting Authority channels on YouTube). */
export type LiveChannel = {
  id: "makkah" | "madinah";
  channelId: string;
  handle: string;
  place: GText;
  channel: GText;
};

export const LIVE_CHANNELS: LiveChannel[] = [
  {
    id: "makkah",
    channelId: "UCos52azQNBgW63_9uDJoPDA",
    handle: "@SaudiQuranTv",
    place: { en: "Masjid al-Haram, Makkah", bn: "মসজিদুল হারাম, মক্কা", ur: "مسجد الحرام، مکہ" },
    channel: { en: "Saudi Qur'an TV — official", bn: "সৌদি কুরআন টিভি — অফিসিয়াল", ur: "سعودی قرآن ٹی وی — آفیشل" },
  },
  {
    id: "madinah",
    channelId: "UCROKYPep-UuODNwyipe6JMw",
    handle: "@SaudiSunnahTv",
    place: { en: "Masjid an-Nabawi, Madinah", bn: "মসজিদে নববী, মদিনা", ur: "مسجد نبوی، مدینہ" },
    channel: { en: "Saudi Sunnah TV — official", bn: "সৌদি সুন্নাহ টিভি — অফিসিয়াল", ur: "سعودی سنہ ٹی وی — آفیشل" },
  },
];

export const channelLiveUrl = (c: LiveChannel) => `https://www.youtube.com/${c.handle}/live`;
