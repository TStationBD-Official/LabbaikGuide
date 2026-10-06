import { Card, PageHeader } from "@/components/ui/card";

/** Server-rendered long-form page (Sources, Privacy). */
export function InfoPage({ title, intro, sections }: { title: string; intro: string; sections: { title: string; body: string }[] }) {
  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader title={title} subtitle={intro} />
      <div className="space-y-4">
        {sections.map((s) => (
          <Card key={s.title} className="p-5">
            <h2 className="mb-2 font-semibold text-primary">{s.title}</h2>
            <p className="leading-relaxed text-foreground/90">{s.body}</p>
          </Card>
        ))}
      </div>
    </article>
  );
}
