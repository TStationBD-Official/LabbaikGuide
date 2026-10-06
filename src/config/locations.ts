/**
 * Supported Haramain locations. Add a new entry here to support more places —
 * every location-aware feature reads from this registry.
 */
export const LOCATIONS = {
  makkah: {
    id: "makkah",
    icon: "🕋",
    mosqueKey: "location.makkahMosque",
    nameKey: "location.makkah",
    /** Coordinates of the Ka'bah. */
    latitude: 21.422487,
    longitude: 39.826206,
    timezone: "Asia/Riyadh",
  },
  madinah: {
    id: "madinah",
    icon: "🕌",
    mosqueKey: "location.madinahMosque",
    nameKey: "location.madinah",
    /** Coordinates of Masjid an-Nabawi. */
    latitude: 24.467206,
    longitude: 39.611133,
    timezone: "Asia/Riyadh",
  },
} as const;

export type LocationId = keyof typeof LOCATIONS;
export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];
export const isLocationId = (v: unknown): v is LocationId =>
  typeof v === "string" && v in LOCATIONS;

export const KAABA = { latitude: 21.422487, longitude: 39.826206 } as const;
