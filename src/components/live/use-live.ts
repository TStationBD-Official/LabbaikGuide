"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "@/services/api-client";

const LiveSchema = z.object({
  channels: z.array(z.object({ id: z.enum(["makkah", "madinah"]), ok: z.boolean(), videoId: z.string().regex(/^[\w-]{11}$/).nullable(), title: z.string().nullable() })),
  checkedAt: z.string(),
});
export type LiveInfo = z.infer<typeof LiveSchema>;

/** Which video is live now on each official channel (re-checked every 5 minutes). */
export function useLiveStreams() {
  return useQuery({
    queryKey: ["live-streams"],
    queryFn: ({ signal }) => apiGet("/api/live", LiveSchema, { signal, timeoutMs: 12_000 }),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
}
