"use client";

import { useQuery } from "@tanstack/react-query";
import type { AboutData } from "@/server/about/service";

export type { AboutApp, AboutCompany, AboutData } from "@/server/about/service";

/**
 * About-page data. Starts from the server-rendered copy, then re-checks our
 * /api/about every minute while open and whenever the app comes back to the
 * foreground, so panel edits appear without a reload.
 */
export function useAbout(initial: AboutData | null) {
  return useQuery({
    queryKey: ["about"],
    queryFn: async ({ signal }): Promise<AboutData> => {
      const res = await fetch("/api/about", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    initialData: initial ?? undefined,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/** Panel image through our cached proxy, resized when the host supports it. */
export const aboutImage = (src: string, w?: 96 | 192 | 480 | 960) =>
  `/api/about/image?u=${encodeURIComponent(src)}${w ? `&w=${w}` : ""}`;
