/**
 * Official 24/7 broadcasts from the two Holy Mosques, by the Saudi Broadcasting Authority (SBA):
 * Saudi Quran TV (Masjid al-Haram, Makkah) and Saudi Sunnah TV (Masjid an-Nabawi, Madinah).
 * Only these official channels are used — no re-uploads or third-party restreams.
 */
export const LIVE_CHANNEL_IDS = ["makkah", "madinah"] as const;
export type LiveChannelId = (typeof LIVE_CHANNEL_IDS)[number];

export type LiveChannel = {
  id: LiveChannelId;
  /** YouTube channel id (UC…). */
  channelId: string;
  handle: string;
  /** Channel name as on YouTube. */
  name: string;
  arabic: string;
};

export const LIVE_CHANNELS: Record<LiveChannelId, LiveChannel> = {
  makkah: { id: "makkah", channelId: "__MAKKAH__", handle: "@SaudiQuranTv", name: "Saudi Quran TV", arabic: "قناة القرآن الكريم" },
  madinah: { id: "madinah", channelId: "UCROKYPep-UuODNwyipe6JMw", handle: "@SaudiSunnahTv", name: "Saudi Sunnah TV", arabic: "قناة السنة النبوية" },
};

export const channelLiveUrl = (c: LiveChannel) => `https://www.youtube.com/channel/${c.channelId}/live`;
