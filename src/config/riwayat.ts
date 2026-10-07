/**
 * Other readings (riwayat) of the Quran, from the King Fahd Glorious Quran
 * Printing Complex (KFGQPC). Each reading uses its own official Unicode text
 * and the KFGQPC font made for it — text and font are never mixed between
 * readings. Readings keep their own verse numbering, so Hafs-based
 * translations, tafsir and audio are not shown with them.
 */
export const RIWAYAT = ["warsh", "qaloon", "shouba", "doori", "soosi", "bazzi", "qumbul"] as const;
export type RiwayahId = (typeof RIWAYAT)[number];

export const RIWAYAH_FONT: Record<RiwayahId, { family: string; file: string }> = {
  warsh: { family: "KFGQPC Warsh", file: "warsh.10.woff2" },
  qaloon: { family: "KFGQPC Qaloon", file: "qaloon.10.woff2" },
  shouba: { family: "KFGQPC Shouba", file: "shouba.8.woff2" },
  doori: { family: "KFGQPC Doori", file: "doori.9.woff2" },
  soosi: { family: "KFGQPC Soosi", file: "soosi.9.woff2" },
  bazzi: { family: "KFGQPC Bazzi", file: "bazzi.7.woff2" },
  qumbul: { family: "KFGQPC Qumbul", file: "qumbul.7.woff2" },
};

export const isRiwayah = (x: string): x is RiwayahId => (RIWAYAT as readonly string[]).includes(x);
