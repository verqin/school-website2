import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { DocumentsPanel } from "@/components/admissions/DocumentsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/site/states";
import {
  EDITABLE_STATUSES,
  STEP_TITLES,
  TOTAL_STEPS,
  applicationDocumentsQuery,
  applicationQuery,
  formDataValue,
  gradeLevelsQuery,
  periodsQuery,
  saveApplicationDraft,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema,
  submitApplication,
  type Application,
} from "@/lib/admissions";

export const Route = createFileRoute("/apply/application/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Application form — Sample1 School Admissions" },
      {
        name: "description",
        content: "Complete your Sample1 School application. Progress is saved automatically at every step.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Application form — Sample1 School Admissions" },
      { property: "og:description", content: "Complete your Sample1 School application step by step." },
    ],
  }),
  component: () => (
    <AuthGate
      title="Applicant sign in"
      description="Sign in to continue your application."
      allowSignUp
    >
      {(user) => <WizardLoader userId={user.id} />}
    </AuthGate>
  ),
});

type Draft = Record<string, string>;

function WizardLoader({ userId }: { userId: string }) {
  const { id } = Route.useParams();
  const application = useQuery(applicationQuery(id));

  if (application.isLoading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-72 w-full rounded-xl" />
      </div>
    );
  }
  if (application.isError) {
    return (
      <div className="container-page py-10">
        <ErrorState onRetry={() => void application.refetch()} />
      </div>
    );
  }
  if (!application.data) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Application not found"
          description="This application does not exist, or it does not belong to your account."
          action={
            <Button asChild>
              <Link to="/apply">Back to my applications</Link>
            </Button>
          }
        />
      </div>
    );
  }
  return <Wizard userId={userId} application={application.data} />;
}

function Wizard({ userId, application }: { userId: string; application: Application }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const periods = useQuery(periodsQuery());
  const grades = useQuery(gradeLevelsQuery());
  const documents = useQuery(applicationDocumentsQuery(application.id));
  const editable = EDITABLE_STATUSES.includes(application.status);

  const [step, setStep] = useState(application.current_step > 0 ? application.current_step : 1);
  const [errors, setErrors] = useState<Draft>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [values, setValues] = useState<Draft>(() => ({
    student_first_name: application.student_first_name ?? "",
    student_last_name: application.student_last_name ?? "",
    student_dob: application.student_dob ?? "",
    guardian_name: application.guardian_name ?? "",
    guardian_email: application.guardian_email ?? "",
    guardian_phone: application.guardian_phone ?? "",
    period_id: application.period_id ?? "",
    grade_level_id: application.grade_level_id ?? "",
    gender: formDataValue(application, "gender"),
    nationality: formDataValue(application, "nationality"),
    home_address: formDataValue(application, "home_address"),
    guardian_relationship: formDataValue(application, "guardian_relationship"),
    alternate_contact: formDataValue(application, "alternate_contact"),
    previous_school: formDataValue(application, "previous_school"),
    previous_grade: formDataValue(application, "previous_grade"),
    achievements: formDataValue(application, "achievements"),
    medical_notes: formDataValue(application, "medical_notes"),
    referral_source: formDataValue(application, "referral_source"),
  }));

  const dirty = useRef(false);
  const set = (key: string, value: string) => {
    dirty.current = true;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const patch = useMemo(
    () => ({
      student_first_name: values["student_first_name"] || null,
      student_last_name: values["student_last_name"] || null,
      student_dob: values["student_dob"] || null,
      guardian_name: values["guardian_name"] || null,
      guardian_email: values["guardian_email"] || null,
      guardian_phone: values["guardian_phone"] || null,
      period_id: values["period_id"] || null,
      grade_level_id: values["grade_level_id"] || null,
      current_step: step,
      form_data: {
        gender: values["gender"] ?? "",
        nationality: values["nationality"] ?? "",
        home_address: values["home_address"] ?? "",
        guardian_relationship: values["guardian_relationship"] ?? "",
        alternate_contact: values["alternate_contact"] ?? "",
        previous_school: values["previous_school"] ?? "",
        previous_grade: values["previous_grade"] ?? "",
        achievements: values["achievements"] ?? "",
        medical_notes: values["medical_notes"] ?? "",
        referral_source: values["referral_source"] ?? "",
      } as never,
    }),
    [values, step],
  );

  /** Autosave: debounced draft persistence while the application is editable. */
  useEffect(() => {
    if (!editable || !dirty.current) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await saveApplicationDraft(application.id, patch);
        setSaveState("saved");
        void queryClient.invalidateQueries({ queryKey: ["applications", "mine"] });
      } catch {
        setSaveState("error");
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [patch, editable, application.id, queryClient]);

  function validateStep(current: number) {
    const schema = current === 1 ? stepOneSchema : current === 2 ? stepTwoSchema : current === 3 ? stepThreeSchema : null;
    if (!schema) return true;
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Draft = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  async function goTo(next: number) {
    if (next > step && !validateStep(step)) return;
    if (editable) {
      try {
        await saveApplicationDraft(application.id, { ...patch, current_step: next });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }
    setStep(Math.min(TOTAL_STEPS, Math.max(1, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    for (const s of [1, 2, 3]) {
      if (!validateStep(s)) {
        setStep(s);
        setSubmitError("Please fix the highlighted fields before submitting.");
        return;
      }
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await saveApplicationDraft(application.id, patch);
      const submitted = await submitApplication(application.id);
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      void navigate({ to: "/apply/status/$id", params: { id: submitted.id } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  const gradeName = grades.data?.find((g) => g.id === values["grade_level_id"])?.name ?? "—";
  const periodName = periods.data?.find((p) => p.id === values["period_id"])?.name ?? "—";

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Application form</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step} of {TOTAL_STEPS}: {STEP_TITLES[step - 1]}
          </p>
        </div>
        <p aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveState === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : saveState === "saved" ? (
            <>
              <Check className="size-4 text-secondary" aria-hidden="true" /> Draft saved
            </>
          ) : saveState === "error" ? (
            <span className="text-destructive">Could not save — check your connection</span>
          ) : (
            "Your progress saves automatically"
          )}
        </p>
      </div>

      <Progress className="mt-6" value={(step / TOTAL_STEPS) * 100} aria-label="Application progress" />
      <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {STEP_TITLES.map((title, index) => (
          <li key={title} className={index + 1 === step ? "font-semibold text-foreground" : undefined}>
            {index + 1}. {title}
          </li>
        ))}
      </ol>

      {!editable ? (
        <p className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-4 text-sm">
          This application has been submitted and can no longer be edited.{" "}
          <Link to="/apply/status/$id" params={{ id: application.id }} className="underline">
            View its status
          </Link>
          .
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border bg-card p-6">
        {step === 1 ? (
          <fieldset disabled={!editable} className="grid gap-5 sm:grid-cols-2">
            <legend className="sr-only">Student details</legend>
            <Field label="Student first name" name="student_first_name" values={values} errors={errors} onChange={set} required />
            <Field label="Student last name" name="student_last_name" values={values} errors={errors} onChange={set} required />
            <Field label="Date of birth" name="student_dob" type="date" values={values} errors={errors} onChange={set} required />
            <Field label="Gender (optional)" name="gender" values={values} errors={errors} onChange={set} />
            <Field label="Nationality (optional)" name="nationality" values={values} errors={errors} onChange={set} />
            <div className="sm:col-span-2">
              <AreaField label="Home address (optional)" name="home_address" values={values} errors={errors} onChange={set} />
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset disabled={!editable} className="grid gap-5 sm:grid-cols-2">
            <legend className="sr-only">Parent or guardian</legend>
            <Field label="Parent / guardian full name" name="guardian_name" values={values} errors={errors} onChange={set} required />
            <Field label="Relationship to student (optional)" name="guardian_relationship" values={values} errors={errors} onChange={set} />
            <Field label="Email" name="guardian_email" type="email" values={values} errors={errors} onChange={set} required />
            <Field label="Phone" name="guardian_phone" type="tel" values={values} errors={errors} onChange={set} required />
            <div className="sm:col-span-2">
              <Field label="Alternate contact (optional)" name="alternate_contact" values={values} errors={errors} onChange={set} />
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset disabled={!editable} className="grid gap-5 sm:grid-cols-2">
            <legend className="sr-only">Academic background</legend>
            <div className="grid gap-2">
              <Label htmlFor="period_id">Admissions intake</Label>
              <select
                id="period_id"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={values["period_id"] ?? ""}
                onChange={(event) => set("period_id", event.target.value)}
              >
                <option value="">Select an intake</option>
                {(periods.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.academic_year})
                  </option>
                ))}
              </select>
              <FieldError message={errors["period_id"]} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade_level_id">Grade level applied for</Label>
              <select
                id="grade_level_id"
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={values["grade_level_id"] ?? ""}
                onChange={(event) => set("grade_level_id", event.target.value)}
              >
                <option value="">Select a grade level</option>
                {(grades.data ?? []).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors["grade_level_id"]} />
            </div>
            <Field label="Previous school (optional)" name="previous_school" values={values} errors={errors} onChange={set} />
            <Field label="Previous grade (optional)" name="previous_grade" values={values} errors={errors} onChange={set} />
            <div className="sm:col-span-2">
              <AreaField label="Achievements or interests (optional)" name="achievements" values={values} errors={errors} onChange={set} />
            </div>
            <div className="sm:col-span-2">
              <AreaField
                label="Medical or learning support needs (optional)"
                name="medical_notes"
                values={values}
                errors={errors}
                onChange={set}
              />
            </div>
            <Field label="How did you hear about us? (optional)" name="referral_source" values={values} errors={errors} onChange={set} />
          </fieldset>
        ) : null}

        {step === 4 ? (
          <DocumentsPanel
            applicationId={application.id}
            userId={userId}
            periodId={values["period_id"] || null}
            gradeLevelId={values["grade_level_id"] || null}
            canUpload={editable}
          />
        ) : null}

        {step === 5 ? (
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Review and submit</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Review label="Student" value={`${values["student_first_name"] ?? ""} ${values["student_last_name"] ?? ""}`.trim()} />
              <Review label="Date of birth" value={values["student_dob"] ?? ""} />
              <Review label="Parent / guardian" value={values["guardian_name"] ?? ""} />
              <Review label="Email" value={values["guardian_email"] ?? ""} />
              <Review label="Phone" value={values["guardian_phone"] ?? ""} />
              <Review label="Intake" value={periodName} />
              <Review label="Grade level" value={gradeName} />
              <Review label="Documents uploaded" value={String((documents.data ?? []).length)} />
            </dl>
            <p className="text-sm text-muted-foreground">
              By submitting you confirm the information provided is accurate. After submission the form locks and the
              admissions office reviews your application.
            </p>
            {submitError ? (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            ) : null}
            <div>
              <Button onClick={() => void handleSubmit()} disabled={submitting || !editable}>
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => void goTo(step - 1)} disabled={step === 1}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button asChild variant="ghost">
            <Link to="/apply">Save & exit</Link>
          </Button>
          {step < TOTAL_STEPS ? <Button onClick={() => void goTo(step + 1)}>Continue</Button> : null}
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  type = "text",
  values,
  errors,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  type?: string | undefined;
  values: Draft;
  errors: Draft;
  onChange: (key: string, value: string) => void;
  required?: boolean | undefined;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        required={required}
        maxLength={255}
        value={values[name] ?? ""}
        aria-invalid={Boolean(errors[name])}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <FieldError message={errors[name]} />
    </div>
  );
}

function AreaField({
  label,
  name,
  values,
  errors,
  onChange,
}: {
  label: string;
  name: string;
  values: Draft;
  errors: Draft;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        rows={3}
        maxLength={1000}
        value={values[name] ?? ""}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <FieldError message={errors[name]} />
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}
