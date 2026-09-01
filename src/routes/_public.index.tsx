import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/primitives";
import { CenteredHeading, ChipList, FeatureCard, ImageHero, SplitFeature } from "@/components/site/blocks";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { eventsListQuery, formatDate, formatDateTime, newsListQuery } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import heroStudents from "@/assets/hero-students.jpg";
import campus from "@/assets/campus.jpg";
import classroom from "@/assets/classroom.jpg";
import playground from "@/assets/playground.jpg";
import library from "@/assets/library.jpg";
import scienceLab from "@/assets/science-lab.jpg";
import sports from "@/assets/sports.jpg";
import ictCentre from "@/assets/ict-centre.jpg";
import staffGroup from "@/assets/staff-group.jpg";

const pageTitle = "Sample1 School - Nurturing Excellence From Early Years to High School";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: pageTitle },
      { name: "description", content: siteConfig.description },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: siteConfig.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const primaryFeatures = [
  {
    image: classroom,
    title: "Modern Classrooms",
    body: "Well-equipped, interactive learning spaces designed to inspire curiosity and foster collaboration among young minds.",
  },
  {
    image: playground,
    title: "Safe Playgrounds",
    body: "Secure outdoor environments where children develop social skills, physical fitness and creative play.",
  },
  {
    image: library,
    title: "Junior Library",
    body: "An extensive collection of books and digital resources that ignites imagination and a lifelong love of reading.",
  },
];

const secondaryFeatures = [
  {
    image: scienceLab,
    title: "Science Laboratories",
    body: "Fully equipped Physics, Chemistry and Biology labs with modern apparatus for hands-on experimentation.",
  },
  {
    image: sports,
    title: "Sports Facilities",
    body: "Athletics, football, basketball and swimming supported by specialised coaching programmes.",
  },
  {
    image: ictCentre,
    title: "ICT Centre",
    body: "Advanced computer labs preparing students with essential digital literacy, robotics and coding skills.",
  },
];

const primarySubjects = [
  "English",
  "Mathematics",
  "Science",
  "Social Studies",
  "ICT",
  "Art",
  "Music",
  "Physical Education",
  "French",
  "Religious Education",
  "Environmental Studies",
  "Life Skills",
];

const secondarySubjects = [
  "English Language",
  "English Literature",
  "Mathematics",
  "Additional Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Business Studies",
  "Accounting",
  "Economics",
  "Computer Science",
  "French",
  "Physical Education",
  "Art & Design",
];

function HomePage() {
  const news = useQuery(newsListQuery(3));
  const events = useQuery(eventsListQuery({ upcomingOnly: true, limit: 4 }));

  return (
    <>
      <ImageHero
        image={heroStudents}
        imageAlt="Sample1 School students in uniform in a bright school common room"
        title={siteConfig.name}
        description="Nurturing excellence from early years to high school. Experience world-class education in a modern, innovative environment."
        size="hero"
        showCrest
        priority
        actions={
          <>
            <Button asChild size="lg" className="rounded-full px-8 font-bold">
              <Link to="/about">Explore Our Campus</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-primary bg-background px-8 font-bold text-primary hover:bg-navy-soft"
            >
              <Link to="/apply">Register Now</Link>
            </Button>
          </>
        }
      />

      <Section id="about" labelledBy="welcome-heading">
        <CenteredHeading
          id="welcome-heading"
          eyebrow="About us"
          title={`Welcome to ${siteConfig.shortName}`}
          description="We provide exceptional education from primary to secondary level. Our goal is to give parents a clear understanding of our learning environment, values and modern facilities - empowering you to make informed decisions about your child's future."
        />
        <SplitFeature image={campus} imageAlt="Sample1 School campus buildings and grounds">
          <h3 className="text-2xl font-extrabold text-primary">A campus built for learning</h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Purpose-built classrooms, laboratories, libraries and sports grounds sit within a secure campus where every
            learner is known by name. Small classes, dedicated teachers and a strong pastoral programme keep academic
            achievement and wellbeing in balance.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="rounded-full px-6 font-bold">
              <Link to="/about">Our story</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 font-bold">
              <Link to="/academics">Academics</Link>
            </Button>
          </div>
        </SplitFeature>
      </Section>

      <Section id="primary" tone="muted" labelledBy="primary-heading">
        <CenteredHeading
          id="primary-heading"
          eyebrow="Primary school"
          title="Strong foundations, happy learners"
          description="Our primary school focuses on building strong academic foundations, creativity and character development through innovative teaching and personalised attention."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {primaryFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      <Section id="secondary" labelledBy="secondary-heading">
        <CenteredHeading
          id="secondary-heading"
          eyebrow="Secondary school"
          title="Prepared for a global future"
          description="Our secondary school prepares learners for global opportunities through academic rigour, holistic development and facilities that ready students for university and beyond."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {secondaryFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      <Section id="curriculum" tone="muted" labelledBy="curriculum-heading">
        <CenteredHeading
          id="curriculum-heading"
          eyebrow="Our curriculum"
          title="Academic excellence and 21st century skills"
          description="A comprehensive curriculum designed to challenge and inspire students at every level."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h3 className="mb-5 text-lg font-bold text-primary">Primary School Subjects</h3>
            <ChipList items={primarySubjects} />
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h3 className="mb-5 text-lg font-bold text-primary">Secondary School Subjects</h3>
            <ChipList items={secondarySubjects} />
          </div>
        </div>
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h3 className="text-lg font-bold text-primary">Examination Boards</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Examination board partnerships and accreditation details will be published here once confirmed by the
            school office.
          </p>
        </div>
      </Section>

      <Section id="staff" labelledBy="staff-heading">
        <CenteredHeading
          id="staff-heading"
          eyebrow="Our people"
          title="Our dedicated staff"
          description="A team of highly qualified and experienced educators committed to the academic, social and emotional growth of every student."
        />
        <div className="overflow-hidden rounded-3xl shadow-xl">
          <img
            src={staffGroup}
            alt="Sample1 School teaching staff group photograph"
            loading="lazy"
            decoding="async"
            className="aspect-[16/7] w-full object-cover"
          />
        </div>
        <div className="mt-8 text-center">
          <Button asChild className="rounded-full px-8 font-bold">
            <Link to="/staff">Meet the team</Link>
          </Button>
        </div>
      </Section>

      <Section tone="muted" labelledBy="news-heading">
        <CenteredHeading id="news-heading" eyebrow="Newsroom" title="Latest news" />
        {news.isPending ? (
          <CardSkeletonGrid count={3} />
        ) : news.isError ? (
          <ErrorState onRetry={() => news.refetch()} />
        ) : news.data.length === 0 ? (
          <EmptyState title="No news published yet" description="Published stories will appear here, newest first." />
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {news.data.map((post) => (
              <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="aspect-[16/10] overflow-hidden bg-navy-soft">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold tracking-wide uppercase text-gold">
                    {post.category ?? "News"} · {formatDate(post.published_at ?? post.created_at)}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-primary">
                    <Link to="/news/$slug" params={{ slug: post.slug }} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-8 font-bold">
            <Link to="/news">All news</Link>
          </Button>
        </div>
      </Section>

      <Section labelledBy="events-heading">
        <CenteredHeading id="events-heading" eyebrow="Calendar" title="Upcoming events" />
        {events.isPending ? (
          <CardSkeletonGrid count={4} />
        ) : events.isError ? (
          <ErrorState onRetry={() => events.refetch()} />
        ) : events.data.length === 0 ? (
          <EmptyState title="No upcoming events" description="Published future events appear here in date order." />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {events.data.map((event) => (
              <li key={event.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                <p className="text-xs font-bold tracking-wide uppercase text-gold">
                  {formatDateTime(event.starts_at)}
                </p>
                <h3 className="mt-2 text-lg font-bold text-primary">
                  <Link to="/events/$slug" params={{ slug: event.slug }} className="hover:underline">
                    {event.title}
                  </Link>
                </h3>
                {event.location ? <p className="mt-1 text-sm text-muted-foreground">{event.location}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="contact" tone="muted" labelledBy="contact-heading">
        <CenteredHeading
          id="contact-heading"
          eyebrow="Get in touch"
          title="We would love to hear from you"
          description="Reach out to learn more about enrolment and to schedule a campus visit."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Phone, label: "Phone", value: siteConfig.contact.phone },
            { icon: Mail, label: "Email", value: siteConfig.contact.email },
            { icon: MapPin, label: "Address", value: siteConfig.contact.addressLines.join(", ") },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-navy-soft text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-primary">{label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild className="rounded-full px-8 font-bold">
            <Link to="/contact">Contact the school</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
