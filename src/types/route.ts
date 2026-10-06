import { z } from "zod";

/** Normalized walking route returned by /api/route/walk. */
export const WalkRouteSchema = z.object({
  distance: z.number().nonnegative(),
  duration: z.number().nonnegative(),
  /** [lon, lat] pairs along roads/footpaths. */
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(2).max(5000),
  source: z.object({ name: z.string(), url: z.string().url() }),
});
export type WalkRoute = z.infer<typeof WalkRouteSchema>;
