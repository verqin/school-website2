import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, Section } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { eventsListQuery, formatDateTime } from "@/lib/content";

const title = "Events & Calendar";
const description = "Upcoming concerts, sports fixtures, parent evenings and celebrations at Sample1 School.";

export const Route = createFileRoute("/_public/events")({
  head: () => ({
    meta: [
      { title: `${title} — Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const events = useQuery(eventsListQuery({ upcomingOnly: true }));

  return (
    <>
      <PageHero eyebrow="Calendar" title={title} description={description} />
      <Section>
        {events.isPending ? (
          <CardSkeletonGrid count={4} />
        ) : events.isError ? (
          <ErrorState onRetry={() => events.refetch()} />
        ) : events.data.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="Published future events will be listed here in date order."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {events.data.map((event) => (
              <li key={event.id} className="rounded-xl border bg-card p-6">
                <p className="text-xs font-semibold tracking-wide uppercase text-secondary">
                  {formatDateTime(event.starts_at)}
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  <Link to="/events/$slug" params={{ slug: event.slug }} className="underline-offset-4 hover:underline">
                    {event.title}
                  </Link>
                </h2>
                {event.location ? <p className="mt-1 text-sm text-muted-foreground">{event.location}</p> : null}
                {event.description ? (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
