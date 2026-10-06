import { notFound } from "next/navigation";
import { z } from "zod";
import { QuranReader } from "@/components/quran/reader";
import { pageMetadata } from "@/i18n/server";
import { MODE_LIMITS, READING_MODES } from "@/types/quran";

const Params = z
  .object({ mode: z.enum(READING_MODES), id: z.coerce.number().int().positive() })
  .refine((p) => p.id <= MODE_LIMITS[p.mode]);
const Search = z.object({ ayah: z.coerce.number().int().positive().max(286).optional().catch(undefined) });

type Props = { params: Promise<{ mode: string; id: string }>; searchParams: Promise<Record<string, string | string[]>> };

export async function generateMetadata({ params }: Props) {
  const p = Params.safeParse(await params);
  return pageMetadata(p.success ? `/quran/${p.data.mode}/${p.data.id}` : "/quran", "quran.title");
}

export default async function ReaderPage({ params, searchParams }: Props) {
  const p = Params.safeParse(await params);
  if (!p.success) notFound();
  const s = Search.parse(await searchParams);
  return <QuranReader key={`${p.data.mode}-${p.data.id}`} mode={p.data.mode} id={p.data.id} initialAyah={s.ayah} />;
}
