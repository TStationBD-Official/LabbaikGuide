import { z } from "zod";

/** Push services we deliver to (prevents using the sender as an open relay / SSRF). */
const PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/,
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)notify\.windows\.com$/,
  /(^|\.)push\.apple\.com$/,
];

export const PushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url()
    .max(1000)
    .refine((u) => {
      try {
        const url = new URL(u);
        return url.protocol === "https:" && PUSH_HOSTS.some((re) => re.test(url.hostname));
      } catch {
        return false;
      }
    }, "unsupported push service"),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
});
export type PushSubscriptionJSONStrict = z.infer<typeof PushSubscriptionSchema>;

export const PushPayloadSchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().max(240),
  /** Same-origin path opened on click. */
  url: z.string().max(200).regex(/^\/(?!\/)/),
  tag: z.string().max(64),
});
export type PushPayload = z.infer<typeof PushPayloadSchema>;

export const ScheduleRequestSchema = z.object({
  subscription: PushSubscriptionSchema,
  items: z.array(PushPayloadSchema.extend({ at: z.number().int() })).max(40),
  cancel: z.array(z.string().max(100)).max(80).default([]),
});

export const DeliverBodySchema = z.object({ subscription: PushSubscriptionSchema, payload: PushPayloadSchema });
