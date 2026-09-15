import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Section, SectionHeading } from "@/components/site/primitives";
import { ImageHero } from "@/components/site/blocks";
import { supabase } from "@/integrations/supabase/client";
import admissionsHero from "@/assets/admissions-hero.jpg";

const title = "Admissions";
const description =
  "Join Cresta Reign Academy through a clear, welcoming application journey for academic education and vocational training.";

export const Route = createFileRoute("/_public/admissions")({
  head: () => ({
    meta: [
      { title: `${title} - Cresta Reign Academy` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdmissionsPage,
});

const steps = [
  { step: "1", title: "Enquire", body: "Send an enquiry through the contact form and the office will respond." },
  { step: "2", title: "Visit", body: "Tour dates will be published here once confirmed by the school." },
  { step: "3", title: "Apply", body: "Complete the application form without creating an account. Our team will contact you with next steps." },
  { step: "4", title: "Enrol", body: "Offer, acceptance and enrolment steps will be tracked in the portal." },
];

function admissionsDataQuery() {
  return {
    queryKey: ["public", "admissions-data"],
    queryFn: async () => {
      const [periods, requirements, grades, programs] = await Promise.all([
        supabase
          .from("admissions_periods")
          .select("id, name, academic_year, opens_at, closes_at, application_fee_cents, currency, instructions")
          .eq("is_active", true)
          .order("opens_at", { ascending: false }),
        supabase
          .from("admissions_requirements")
          .select("id, label, description, is_mandatory, requires_document, sort_order")
          .eq("is_active", true)
          .order("sort_order"),
        supabase.from("grade_levels").select("id, name, sort_order").eq("is_active", true).order("sort_order"),
        supabase.from("programs").select("id, name, summary").eq("is_published", true).limit(8),
      ]);
      return {
        periods: periods.data ?? [],
        requirements: requirements.data ?? [],
        grades: grades.data ?? [],
        programs: programs.data ?? [],
      };
    },
  };
}

function money(cents: number, currency: string) {
  if (!cents) return "No application fee";
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

function AdmissionsPage() {
  const data = useQuery(admissionsDataQuery());
  const periods = data.data?.periods ?? [];
  const requirements = data.data?.requirements ?? [];
  const grades = data.data?.grades ?? [];

  return (
    <>
      <ImageHero image={admissionsHero} imageAlt="Parents meeting the Cresta Reign Academy admissions team" eyebrow="Join us" title={title} description={description} />

      <Section labelledBy="steps-heading">
        <SectionHeading id="steps-heading" eyebrow="The journey" title="Four steps to joining Cresta Reign" />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <li key={item.step}>
              <Card className="h-full">
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {item.step}
                  </span>
                  <CardTitle className="mt-3 text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.body}</CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted" labelledBy="intakes-heading">
        <SectionHeading
          id="intakes-heading"
          eyebrow="Open now"
          title="Intakes, fees and key dates"
          description="Live from the school office. Intakes and their dates are maintained by admissions staff."
        />
        {data.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No intake is open at the moment. Send an enquiry and the office will tell you when the
            next one opens.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {periods.map((period) => (
              <article key={period.id} className="rounded-2xl border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-purple">{period.name}</h3>
                    <p className="text-sm text-muted-foreground">Academic year {period.academic_year}</p>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-royal" aria-hidden="true" />
                    <dt className="sr-only">Dates</dt>
                    <dd>
                      Opens {new Date(period.opens_at).toLocaleDateString()}
                      {period.closes_at ? ` - closes ${new Date(period.closes_at).toLocaleDateString()}` : ""}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-royal" aria-hidden="true" />
                    <dt className="sr-only">Application fee</dt>
                    <dd>{money(period.application_fee_cents, period.currency)}</dd>
                  </div>
                </dl>
                {period.instructions ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{period.instructions}</p>
                ) : null}
                <Button asChild className="mt-6 rounded-full">
                  <Link to="/apply">Apply for this intake</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section labelledBy="requirements-heading">
        <SectionHeading
          id="requirements-heading"
          eyebrow="What to prepare"
          title="Entry requirements and documents"
          description="Bring the originals to the school office once your application has been reviewed."
        />
        {data.isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The requirement list is being finalised by the admissions office.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {requirements.map((requirement) => (
              <li key={requirement.id} className="flex gap-3 rounded-2xl border bg-card p-5">
                {requirement.requires_document ? (
                  <FileText className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold text-purple">
                    {requirement.label}
                    {requirement.is_mandatory ? "" : " (optional)"}
                  </p>
                  {requirement.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{requirement.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {grades.length ? (
          <div className="mt-10">
            <h3 className="text-sm font-bold tracking-[0.16em] uppercase text-royal">
              Grades and levels accepting applications
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {grades.map((grade) => (
                <li key={grade.id} className="rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-purple">
                  {grade.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section tone="muted" labelledBy="next-heading">
        <SectionHeading
          id="next-heading"
          eyebrow="Ready when you are"
          title="Apply online in about ten minutes"
          description="No account and no password. Fill in the form, get a reference number and track progress with that number and your email."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full px-7">
            <Link to="/apply">Start an application</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-7">
            <Link to="/contact">Send an enquiry</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/academics">See programmes</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
