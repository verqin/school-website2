import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/admissions";
import { submitPublicApplication, trackPublicApplication } from "@/lib/public-apply.functions";

const title = "Apply to Cresta Reign Academy";
const description =
  "Complete the application form in one sitting. No account, no password - you get a reference number as soon as you send it.";

export const Route = createFileRoute("/apply/")({
  head: () => ({
    meta: [
      { title: `${title} - Admissions` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ApplyPage,
});

function optionsQuery() {
  return {
    queryKey: ["public", "apply-options"],
    queryFn: async () => {
      const [periods, grades] = await Promise.all([
        supabase.from("admissions_periods").select("id, name, academic_year, instructions, application_fee_cents, currency, closes_at").eq("is_active", true).order("opens_at", { ascending: false }),
        supabase.from("grade_levels").select("id, name, sort_order").eq("is_active", true).order("sort_order"),
      ]);
      return { periods: periods.data ?? [], grades: grades.data ?? [] };
    },
  };
}

function ApplyPage() {
  const options = useQuery(optionsQuery());
  const submit = useServerFn(submitPublicApplication);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    setBusy(true);
    setError("");
    try {
      const result = await submit({
        data: {
          student_first_name: value("student_first_name"),
          student_last_name: value("student_last_name"),
          student_dob: value("student_dob"),
          gender: value("gender"),
          nationality: value("nationality"),
          home_address: value("home_address"),
          guardian_name: value("guardian_name"),
          guardian_email: value("guardian_email"),
          guardian_phone: value("guardian_phone"),
          guardian_relationship: value("guardian_relationship"),
          period_id: value("period_id") || null,
          grade_level_id: value("grade_level_id") || null,
          previous_school: value("previous_school"),
          previous_grade: value("previous_grade"),
          medical_notes: value("medical_notes"),
          message: value("message"),
        },
      });
      setReference(result.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? "We could not send this application. Check the required fields and try again."
          : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto size-12 text-secondary" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-semibold text-purple">Application received</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Keep this reference number safe. Use it with the parent email address to check progress
            at any time.
          </p>
          <p className="mt-6 rounded-2xl bg-navy-soft px-6 py-4 text-2xl font-bold tracking-wider text-purple">
            {reference}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/">Back to website</Link>
            </Button>
            <Button onClick={() => setReference(null)}>Send another application</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold tracking-[0.24em] uppercase text-gold">Admissions</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-purple">{title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>

        <form className="mt-10 grid gap-8" onSubmit={onSubmit}>
          <Fieldset legend="Student details">
            <Field id="student_first_name" label="Student first name" required />
            <Field id="student_last_name" label="Student last name" required />
            <Field id="student_dob" label="Date of birth" type="date" required />
            <Field id="gender" label="Gender" />
            <Field id="nationality" label="Nationality" />
            <Field id="home_address" label="Home address" className="sm:col-span-2" />
          </Fieldset>

          <Fieldset legend="Parent or guardian">
            <Field id="guardian_name" label="Full name" required />
            <Field id="guardian_relationship" label="Relationship to student" />
            <Field id="guardian_email" label="Email address" type="email" required />
            <Field id="guardian_phone" label="Phone number" required />
          </Fieldset>

          <Fieldset legend="Programme">
            <div className="grid gap-2">
              <Label htmlFor="period_id">Intake</Label>
              <select id="period_id" name="period_id" className="h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">Not sure yet</option>
                {(options.data?.periods ?? []).map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name} ({period.academic_year})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade_level_id">Grade or level applied for</Label>
              <select id="grade_level_id" name="grade_level_id" className="h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">Not sure yet</option>
                {(options.data?.grades ?? []).map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>
            <Field id="previous_school" label="Previous school" />
            <Field id="previous_grade" label="Last grade completed" />
          </Fieldset>

          <Fieldset legend="Anything else we should know">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="medical_notes">Medical or learning support notes</Label>
              <Textarea id="medical_notes" name="medical_notes" rows={3} maxLength={1000} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="message">Message to the admissions office</Label>
              <Textarea id="message" name="message" rows={3} maxLength={1000} />
            </div>
          </Fieldset>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div>
            <Button type="submit" size="lg" className="rounded-full px-8" disabled={busy}>
              {busy ? "Sending application..." : "Send application"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              No account is created. Supporting documents are handed in at the school office or
              requested by email after review.
            </p>
          </div>
        </form>

        <TrackApplication />
      </div>
    </div>
  );
}

function TrackApplication() {
  const track = useServerFn(trackPublicApplication);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | { reference_code: string | null; status: ApplicationStatus; submitted_at: string | null; student_first_name: string | null; student_last_name: string | null; decision_note: string | null }
    | null
  >(null);
  const [notFound, setNotFound] = useState(false);

  return (
    <section aria-labelledby="track-heading" className="mt-16 rounded-3xl border bg-muted/40 p-6">
      <h2 id="track-heading" className="text-xl font-semibold text-purple">
        Track an application
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the reference number you received and the parent email you used.
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setBusy(true);
          setNotFound(false);
          try {
            const found = await track({
              data: {
                reference: String(form.get("reference") ?? "").trim(),
                email: String(form.get("email") ?? "").trim(),
              },
            });
            setResult(found ?? null);
            setNotFound(!found);
          } catch {
            setNotFound(true);
            setResult(null);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="track-reference">Reference number</Label>
          <Input id="track-reference" name="reference" required maxLength={40} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="track-email">Parent email</Label>
          <Input id="track-email" name="email" type="email" required maxLength={255} />
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="outline" disabled={busy}>
            <Search className="size-4" aria-hidden="true" /> Check
          </Button>
        </div>
      </form>
      {notFound ? (
        <p className="mt-4 text-sm text-destructive">
          No application matches that reference and email.
        </p>
      ) : null}
      {result ? (
        <div className="mt-4 rounded-2xl border bg-card p-4 text-sm">
          <p className="font-semibold text-purple">
            {`${result.student_first_name ?? ""} ${result.student_last_name ?? ""}`.trim() || "Application"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {result.reference_code} - {STATUS_LABELS[result.status]}
            {result.submitted_at
              ? ` - sent ${new Date(result.submitted_at).toLocaleDateString()}`
              : ""}
          </p>
          {result.decision_note ? <p className="mt-2">{result.decision_note}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl border bg-card p-6">
      <legend className="px-2 text-sm font-bold tracking-[0.14em] uppercase text-royal">
        {legend}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
  className = "",
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input id={id} name={id} type={type} required={required} maxLength={300} />
    </div>
  );
}
