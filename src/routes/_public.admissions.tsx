import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { PlaceholderNote } from "@/components/site/states";

const title = "Admissions";
const description =
  "How to join Sample1 School: enquiry, application and enrolment. The online application experience is coming soon.";

export const Route = createFileRoute("/_public/admissions")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
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
  { step: "3", title: "Apply", body: "Create an account and complete the online application - your progress saves as you go." },
  { step: "4", title: "Enrol", body: "Offer, acceptance and enrolment steps will be tracked in the portal." },
];

function AdmissionsPage() {
  return (
    <>
      <PageHero eyebrow="Join us" title={title} description={description} />

      <Section labelledBy="steps-heading">
        <SectionHeading id="steps-heading" eyebrow="The journey" title="Four steps to joining Sample1" />
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

      <Section tone="muted" labelledBy="next-heading">
        <SectionHeading
          id="next-heading"
          eyebrow="Coming soon"
          title="Online applications are in development"
          description="This page is the integration point for the admissions workflow: online forms, document upload, application tracking and staff review."
        />
        <PlaceholderNote>
          Entry requirements, fees, key dates and required documents must be provided by the school before launch.
        </PlaceholderNote>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact">Send an enquiry</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/academics">See programmes</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
