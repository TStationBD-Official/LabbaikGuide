"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

const Surah = z.array(z.string().min(1).nullable());

/**
 * Bengali pronunciation (উচ্চারণ) per verse key for the given surahs, loaded
 * from static files (cached for offline use). `null` = not available for that verse.
 */
export function useBnUccharon(chapterIds: number[], enabled: boolean): Map<string, string | null> | null {
  const ids = [...new Set(chapterIds)].sort((a, b) => a - b);
  return useQueries({
    queries: ids.map((c) => ({
      queryKey: ["bn-uccharon", c],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const res = await fetch(`/data/bn-uccharon/${c}.json`, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return Surah.parse(await res.json());
      },
      enabled,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
    })),
    combine: (results) => {
      if (!enabled) return null;
      const map = new Map<string, string | null>();
      results.forEach((r, i) => r.data?.forEach((t, n) => map.set(`${ids[i]}:${n + 1}`, t)));
      return map;
    },
  });
}
