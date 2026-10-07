import { notFound } from "next/navigation";
import { z } from "zod";
import { RiwayahReader } from "@/components/quran/riwayah";
import { RIWAYAT } from "@/config/riwayat";
import { pageMetadata } from "@/i18n/server";

const Params = z.object({ r: z.enum(RIWAYAT), s: z.coerce.number().int().min(1).max(114) });
type Props = { params: Promise<{ r: string; s: string }> };

export async function generateMetadata({ params }: Props) {
  const p = Params.safeParse(await params);
  return pageMetadata(p.success ? `/quran/riwayah/${p.data.r}/${p.data.s}` : "/quran/riwayah", "riwayah.title");
}

export default async function RiwayahSurahPage({ params }: Props) {
  const p = Params.safeParse(await params);
  if (!p.success) notFound();
  return <RiwayahReader key={`${p.data.r}-${p.data.s}`} r={p.data.r} s={p.data.s} />;
}
