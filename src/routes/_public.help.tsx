import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ExternalLink, Printer, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/site/primitives";

export const Route = createFileRoute("/_public/help")({
  head: () => ({ meta: [{ title: "Platform manuals - Cresta Reign Academy" }] }),
  component: HelpPage,
});

const manuals = [
  { title: "Admissions and applicant guide", audience: "Applicants and families", path: "/apply", body: "Complete the public application without creating an account. Save the reference number and use the email supplied on the application to track progress." },
  { title: "Staff command centre guide", audience: "School staff", path: "/admin", body: "The staff area is protected by Supabase staff authentication. It includes content, admissions, setup and communication controls." },
  { title: "Admissions operations guide", audience: "Admissions staff", path: "/admin/admissions", body: "Search, filter, review and export applications. Open an applicant record to review academic history and update its status." },
  { title: "Student register guide", audience: "Student services", path: "/admin/students", body: "Review the learner register, search by learner or class and monitor attendance, averages and support alerts." },
  { title: "Finance workspace guide", audience: "Bursar and finance staff", path: "/admin/finance", body: "Review fee structures, balances and payment activity. Record payments only after confirming the transaction with the school office." },
  { title: "Parent portal guide", audience: "Parents and guardians", path: "/parent", body: "Sign in with the parent account issued by the school to view learner attendance, progress, fees, notices and reports." },
  { title: "Teacher workspace guide", audience: "Teachers", path: "/teacher", body: "Sign in with the staff account issued by the school to access timetable, classes, attendance, marks and assignments." },
];

function HelpPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-primary px-6 py-16 text-primary-foreground">
        <div className="container-page max-w-4xl">
          <Badge variant="secondary">Cresta Reign Academy</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Platform manuals, without the guesswork.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80">A practical guide to applying, tracking an application and using the school workspaces. Credentials are never published here: the school issues accounts and Supabase verifies them.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.print()}><Printer data-icon="inline-start" /> Print / save as PDF</Button>
            <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><a href="/manuals/cresta-reign-academy-platform-manual.md" download><Download data-icon="inline-start" /> Download Markdown</a></Button>
          </div>
        </div>
      </section>
      <Section labelledBy="manuals-heading">
        <SectionHeading id="manuals-heading" eyebrow="Quick reference" title="Every workspace in one place" description="Choose the guide for the role you are using. On a phone, the cards remain easy to scan; on paper, use the print action above." />
        <div className="grid gap-5 md:grid-cols-2">
          {manuals.map((manual) => (
            <Card key={manual.title} className="border-primary/10 bg-card/80 shadow-sm">
              <CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="outline">{manual.audience}</Badge><ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" /></div><CardTitle className="mt-3 text-xl">{manual.title}</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{manual.body}</p><Button asChild variant="link" className="mt-3 h-auto px-0"><Link to={manual.path}>Open workspace</Link></Button></CardContent>
            </Card>
          ))}
        </div>
      </Section>
      <Section tone="muted" labelledBy="credentials-heading">
        <div className="flex items-start gap-4 rounded-2xl border border-gold/30 bg-gold/10 p-6"><ShieldCheck className="mt-1 size-6 shrink-0 text-royal" aria-hidden="true" /><div><h2 id="credentials-heading" className="text-xl font-semibold text-purple">Credentials and access</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">There are no public demo passwords in this manual. Staff and parent accounts must be created and assigned by an authorised Cresta Reign Academy administrator through the existing Supabase authentication flow. If you have an account but cannot sign in, contact the school office rather than sharing a password.</p></div></div>
      </Section>
    </>
  );
}

export default HelpPage;

void Download;
void ExternalLink;
void ShieldCheck;
