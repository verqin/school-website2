import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFrame, PageHero, Prose, Section, SectionHeading } from "@/components/site/primitives";
import { ErrorState, PlaceholderNote } from "@/components/site/states";
import { Skeleton } from "@/components/ui/skeleton";
import { pageQuery } from "@/lib/content";

const title = "About Sample1 School";
const description =
  "Our story, mission, values and leadership - managed by school staff through the Sample1 content admin.";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

const values = [
  { title: "Mission", body: "Add the school's mission statement in the admin area." },
  { title: "Vision", body: "Add the school's long-term vision statement." },
  { title: "Values", body: "List the values the community commits to each day." },
];

function AboutPage() {
  const page = useQuery(pageQuery("about"));

  return (
    <>
      <PageHero eyebrow="About us" title={page.data?.title ?? title} description={page.data?.subtitle ?? description} />

      <Section labelledBy="story-heading">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading id="story-heading" eyebrow="Our story" title="A community shaped by its people" />
            {page.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-9/12" />
              </div>
            ) : page.isError ? (
              <ErrorState onRetry={() => page.refetch()} />
            ) : page.data?.body ? (
              <Prose text={page.data.body} />
            ) : (
              <PlaceholderNote>
                The school's history and narrative have not been published yet. Create a page with the slug
                <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">about</code> in the admin area and this
                section will render it.
              </PlaceholderNote>
            )}
          </div>
          <MediaFrame src={page.data?.hero_image_url} alt="Sample1 School campus" />
        </div>
      </Section>

      <Section tone="muted" labelledBy="values-heading">
        <SectionHeading id="values-heading" eyebrow="What guides us" title="Mission, vision and values" />
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
