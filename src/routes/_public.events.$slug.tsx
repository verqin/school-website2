import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero, Prose, Section } from "@/components/site/primitives";
import { EmptyState, ErrorState } from "@/components/site/states";
import { eventQuery, formatDateTime } from "@/lib/content";

export const Route = createFileRoute("/_public/events/$slug")({
  head: () => ({
    meta: [
      { title: "Event - Sample1 School" },
      { name: "description", content: "Details for an upcoming Sample1 School event." },
      { property: "og:title", content: "Event - Sample1 School" },
      { property: "og:description", content: "Details for an upcoming Sample1 School event." },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const event = useQuery(eventQuery(slug));

  if (event.isPending) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </Section>
    );
  }

  if (event.isError) {
    return (
      <Section>
        <ErrorState onRetry={() => event.refetch()} />
      </Section>
    );
  }

  if (!event.data) {
    return (
      <Section>
        <EmptyState
          title="Event not found"
          description="This event may have been removed or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link to="/events">Back to events</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={formatDateTime(event.data.starts_at)}
        title={event.data.title}
        description={event.data.description ?? undefined}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          {event.data.location ? (
            <p className="mb-6 text-sm font-medium text-secondary">Location: {event.data.location}</p>
          ) : null}
          <Prose text={event.data.description ?? ""} />
          <div className="mt-10">
            <Button asChild variant="outline">
              <Link to="/events">Back to all events</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
