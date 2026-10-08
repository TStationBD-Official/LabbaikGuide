import "server-only";
import { z } from "zod";
import { SERVER_CONFIG } from "@/config/server";

/** Tag on every upstream fetch, so one revalidateTag() refreshes the whole About page. */
export const ABOUT_TAG = "about";

const url = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https?:\/\//i.test(u))
  .nullish()
  .catch(null);
const text = z.string().nullish().catch(null);

const CompanySchema = z.object({
  name: z.string().catch(""),
  logo: url,
  banner: url,
  description: text,
  longDescription: text,
  supportEmail: text,
  freelanceEmail: text,
  contactNumber: text,
  whatsappNumber: text,
  location: text,
  websiteUrl: url,
  playStoreUrl: url,
  facebookUrl: url,
  instagramUrl: url,
  tiktokUrl: url,
  linkedinUrl: url,
  featuredAppIds: z.array(z.string()).catch([]),
});

const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortDescription: text,
  longDescription: text,
  logo: url,
  banner: url,
  version: text,
  releaseNotes: text,
  category: text,
  platforms: z.array(z.string()).catch([]),
  tags: z.array(z.string()).catch([]),
  website: url,
  github: url,
  playStoreUrl: url,
  windowsDownloadUrl: url,
  linuxDownloadUrl: url,
  macosDownloadUrl: url,
  supportEmail: text,
  privacyPolicyUrl: url,
  termsUrl: url,
  featured: z.boolean().catch(false),
  priority: z.number().catch(0),
  published: z.boolean().optional(),
  screenshots: z
    .array(z.object({ url: z.string().url(), order: z.number().catch(0) }))
    .catch([])
    .transform((s) => [...s].sort((a, b) => a.order - b.order).map((x) => x.url)),
  updatedAt: text,
});

const Envelope = z.object({ success: z.literal(true), data: z.unknown() });

export type AboutCompany = z.infer<typeof CompanySchema>;
export type AboutApp = z.infer<typeof AppSchema>;
export type AboutData = { company: AboutCompany; apps: AboutApp[] };

class UpstreamError extends Error {
  constructor(
    public status: number,
    path: string,
  ) {
    super(`About API ${path}: HTTP ${status}`);
  }
}

async function get<T extends z.ZodTypeAny>(path: string, schema: T): Promise<z.infer<T>> {
  const res = await fetch(new URL(path, SERVER_CONFIG.about.apiBase), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(SERVER_CONFIG.about.timeoutMs),
    // Shared data cache: served instantly, refreshed in the background every few minutes,
    // and dropped at once when the panel calls /api/about/revalidate.
    next: { revalidate: SERVER_CONFIG.about.revalidateSeconds, tags: [ABOUT_TAG] },
  });
  if (!res.ok) throw new UpstreamError(res.status, path);
  return schema.parse(Envelope.parse(await res.json()).data);
}

const AppsPage = z.object({ items: z.array(z.unknown()), totalPages: z.number().int().catch(1) });

/** Parse items one by one so a single malformed app never hides the rest. */
function parseApps(items: unknown[]): AboutApp[] {
  return items.flatMap((i) => {
    const r = AppSchema.safeParse(i);
    return r.success && r.data.published !== false ? [r.data] : [];
  });
}

async function getAllApps(): Promise<AboutApp[]> {
  const first = await get("/api/apps?pageSize=100&page=1", AppsPage);
  const pages = Math.min(first.totalPages, 10);
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => get(`/api/apps?pageSize=100&page=${i + 2}`, AppsPage)));
  return parseApps([first, ...rest].flatMap((p) => p.items));
}

/** Featured apps (in the company's order) first, then the rest by priority. */
export function orderApps(apps: AboutApp[], featuredIds: string[]): AboutApp[] {
  const rank = new Map(featuredIds.map((id, i) => [id, i]));
  return [...apps].sort((a, b) => {
    const fa = rank.get(a.id) ?? Infinity;
    const fb = rank.get(b.id) ?? Infinity;
    if (fa !== fb) return fa - fb;
    return b.priority - a.priority || a.name.localeCompare(b.name);
  });
}

export async function getAbout(): Promise<AboutData> {
  const [company, apps] = await Promise.all([get("/api/company", CompanySchema), getAllApps()]);
  // Featured ids that are not in the published list are unpublished or deleted: skipped, never guessed.
  return { company, apps: orderApps(apps, company.featuredAppIds) };
}

/** Image hosts the About page may show (through our proxy). */
export function allowedImage(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const h = u.hostname;
  const api = new URL(SERVER_CONFIG.about.apiBase).hostname;
  const ok = h === api || /^tpanel[a-z0-9-]*\.vercel\.app$/.test(h) || h.endsWith(".googleusercontent.com");
  return ok ? u : null;
}

/** Google-hosted images can be resized by the host itself (`=w480`), which saves a lot of data for screenshots. */
export function sizedImage(u: URL, width?: number): URL {
  if (!width || !u.hostname.endsWith(".googleusercontent.com")) return u;
  const out = new URL(u);
  out.pathname = out.pathname.replace(/=[^/]*$/, "") + `=w${width}`;
  return out;
}
