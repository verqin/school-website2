import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarDays, HeartHandshake, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFrame, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState, PlaceholderNote } from "@/components/site/states";
import { eventsListQuery, formatDate, formatDateTime, newsListQuery, programsQuery } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Sample1 School — K-12 Learning Community" },
      { name: "description", content: siteConfig.description },
      { property: "og:title", content: "Sample1 School — K-12 Learning Community" },
      { property: "og:description", content: siteConfig.description },
    ],
  }),
  component: HomePage,
});

const pillars = [
  {
    icon: BookOpen,
    title: "Academic depth",
    body: "Programme details are managed in the admin area so the curriculum team keeps this page current.",
  },
  {
    icon: HeartHandshake,
    title: "Character & care",
    body: "Pastoral care, houses and wellbeing content can be published without touching code.",
  },
  {
    icon: Sparkles,
    title: "Beyond the classroom",
    body: "Clubs, sport and arts highlights are drawn from news, events and the gallery.",
  },
];

function HomePage() {
  const news = useQuery(newsListQuery(3));
  const events = useQuery(eventsListQuery({ upcomingOnly: true, limit: 4 }));
  const programs = useQuery(programsQuery());

  return (
    <>
      <PageHero
        eyebrow="Welcome to Sample1"
        title="A school built around curiosity, character and community"
        description="Sample1 School is a content-managed website: every headline, programme, event and photo below is published by school staff from the secure admin area."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link to="/admissions">Start an application</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            <Link to="/about">Discover our school</Link>
          </Button>
        </div>
      </PageHero>

      <Section labelledBy="pillars-heading">
        <SectionHeading
          id="pillars-heading"
          eyebrow="Why Sample1"
          title="Three commitments that shape every school day"
          description="Replace this narrative with the school's own positioning statement — the structure is ready."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="h-full border-border/70 transition-shadow hover:shadow-lg">
              <CardHeader>
                <span className="mb-2 flex size-11 items-center justify-center rounded-lg bg-navy-soft text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">{body}</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted" labelledBy="programs-heading">
        <SectionHeading
          id="programs-heading"
          eyebrow="Academics"
          title="Programmes across the school"
          description="Published programmes appear here automatically."
        />
        {programs.isPending ? (
          <CardSkeletonGrid count={3} />
        ) : programs.isError ? (
          <ErrorState onRetry={() => programs.refetch()} />
        ) : programs.data.length === 0 ? (
          <EmptyState
            title="No programmes published yet"
            description="Add programmes in the admin area and they will be listed here with level, summary and detail."
            action={
              <Button asChild variant="outline">
                <Link to="/academics">View academics page</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.data.slice(0, 6).map((program) => (
              <Card key={program.id} className="h-full">
                <CardHeader>
                  {program.level ? <Badge variant="secondary">{program.level}</Badge> : null}
                  <CardTitle className="mt-2 text-lg">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {program.summary ?? "Summary to be added."}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section labelledBy="news-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="news-heading"
            eyebrow="Latest news"
            title="What's happening at Sample1"
          />
          <Button asChild variant="ghost" className="mb-10">
            <Link to="/news">
              All news <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        {news.isPending ? (
          <CardSkeletonGrid count={3} />
        ) : news.isError ? (
          <ErrorState onRetry={() => news.refetch()} />
        ) : news.data.length === 0 ? (
          <EmptyState
            title="No news published yet"
            description="Stories published from the admin area will appear here, newest first."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.data.map((post) => (
              <article key={post.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card">
                <MediaFrame src={post.cover_image_url} alt={post.title} ratio="aspect-[16/10]" />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium text-secondary">
                    {post.category ?? "News"} · {formatDate(post.published_at ?? post.created_at)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    <Link
                      to="/news/$slug"
                      params={{ slug: post.slug }}
                      className="underline-offset-4 group-hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section tone="forest" labelledBy="events-heading">
        <SectionHeading
          id="events-heading"
          eyebrow="School calendar"
          title="Upcoming events"
          description="Only future, published events are shown."
        />
        {events.isPending ? (
          <CardSkeletonGrid count={2} />
        ) : events.isError ? (
          <ErrorState onRetry={() => events.refetch()} />
        ) : events.data.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="Publish events in the admin area to populate the calendar."
            icon={<CalendarDays className="size-5" aria-hidden="true" />}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {events.data.map((event) => (
              <li key={event.id} className="rounded-xl border bg-card p-5">
                <p className="text-xs font-semibold tracking-wide uppercase text-secondary">
                  {formatDateTime(event.starts_at)}
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  <Link
                    to="/events/$slug"
                    params={{ slug: event.slug }}
                    className="underline-offset-4 hover:underline"
                  >
                    {event.title}
                  </Link>
                </h3>
                {event.location ? (
                  <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section labelledBy="cta-heading">
        <div className="rounded-2xl border bg-card p-8 sm:p-12">
          <SectionHeading
            id="cta-heading"
            eyebrow="Visit us"
            title="Come and see the school for yourself"
            description="Tour bookings and the full application journey arrive with the admissions release."
          />
          <PlaceholderNote>
            Campus tour times, term dates and fee information still need to be supplied by the school.
          </PlaceholderNote>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">Contact the office</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/gallery">Browse the gallery</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
