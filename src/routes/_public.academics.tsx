import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFrame, PageHero, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState, PlaceholderNote } from "@/components/site/states";
import { pageQuery, programsQuery } from "@/lib/content";

const title = "Academics & Programmes";
const description =
  "Explore the academic programmes offered at Sample1 School, from early years through to senior school.";

export const Route = createFileRoute("/_public/academics")({
  head: () => ({
    meta: [
      { title: `${title} — Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AcademicsPage,
});

function AcademicsPage() {
  const page = useQuery(pageQuery("academics"));
  const programs = useQuery(programsQuery());

  return (
    <>
      <PageHero eyebrow="Academics" title={page.data?.title ?? title} description={page.data?.subtitle ?? description} />

      <Section labelledBy="approach-heading">
        <SectionHeading id="approach-heading" eyebrow="Our approach" title="Teaching and learning at Sample1" />
        {page.data?.body ? (
          <Prose text={page.data.body} className="max-w-3xl" />
        ) : (
          <PlaceholderNote>
            Curriculum framework, assessment approach and subject offerings still need to be supplied. Publish a page
            with the slug <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">academics</code> to fill this
            section.
          </PlaceholderNote>
        )}
      </Section>

      <Section tone="muted" labelledBy="programmes-heading">
        <SectionHeading id="programmes-heading" eyebrow="Programmes" title="Stages of learning" />
        {programs.isPending ? (
          <CardSkeletonGrid count={3} />
        ) : programs.isError ? (
          <ErrorState onRetry={() => programs.refetch()} />
        ) : programs.data.length === 0 ? (
          <EmptyState
            title="No programmes published yet"
            description="Each programme supports a name, level, summary, detailed description and image."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.data.map((program) => (
              <Card key={program.id} className="flex h-full flex-col overflow-hidden pt-0">
                <MediaFrame src={program.image_url} alt={program.name} ratio="aspect-[16/10]" className="rounded-none" />
                <CardHeader>
                  {program.level ? <Badge variant="secondary">{program.level}</Badge> : null}
                  <CardTitle className="mt-2 text-lg">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>{program.summary ?? "Summary to be added."}</p>
                  {program.details ? <Prose text={program.details} className="text-sm" /> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
