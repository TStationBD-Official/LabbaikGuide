"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { MAP_STYLE_IDS, type MapStyleId } from "@/components/places/map-styles";

/** Translated names for the map looks in the picker. */
export function useMapStyleNames(): Record<MapStyleId, string> {
  const { t } = useI18n();
  return useMemo(() => Object.fromEntries(MAP_STYLE_IDS.map((id) => [id, t(`mapStyle.${id}`)])) as Record<MapStyleId, string>, [t]);
}
