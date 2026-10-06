import { z } from "zod";
import { LOCATION_IDS, type LocationId } from "@/config/locations";
import { handleGet } from "@/server/route-helpers";
import { haramainScheduleService } from "@/server/haramain/service";

const Query = z.object({
  location: z.enum(LOCATION_IDS as [LocationId, ...LocationId[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  return handleGet(req, Query, (q) => haramainScheduleService.getPrayerSchedule(q.location, q.date), {
    sMaxAge: 60 * 5,
    swr: 60 * 10,
  });
}
