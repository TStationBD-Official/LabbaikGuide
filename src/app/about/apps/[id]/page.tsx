import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutAppPage } from "@/components/about/about-app-page";
import { pageMetadata } from "@/i18n/server";
import { getAbout, type AboutData } from "@/server/about/service";

type Props = { params: Promise<{ id: string }> };
const validId = (id: string) => /^[A-Za-z0-9_-]{1,64}$/.test(id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const base = await pageMetadata(`/about/apps/${id}`, "about.title");
  const app = validId(id) ? (await getAbout().catch(() => null))?.apps.find((a) => a.id === id) : undefined;
  return app ? { ...base, title: app.name, description: app.shortDescription ?? base.description } : base;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!validId(id)) notFound();
  const initial: AboutData | null = await getAbout().catch(() => null);
  return <AboutAppPage key={id} id={id} initial={initial} />;
}
