import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { DocumentsPanel } from "@/components/admissions/DocumentsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/site/states";
import {
  EDITABLE_STATUSES,
  STATUS_LABELS,
  STATUS_TIMELINE,
  applicantInterviewsQuery,
  applicationQuery,
  statusHistoryQuery,
} from "@/lib/admissions";

export const Route = createFileRoute("/apply/status/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Application status - Sample1 School Admissions" },
      {
        name: "description",
        content: "Track the progress of your Sample1 School application, documents and interview details.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Application status - Sample1 School Admissions" },
      { property: "og:description", content: "Track the progress of your Sample1 School application." },
    ],
  }),
  component: () => (
    <AuthGate title="Applicant sign in" description="Sign in to view your application status." allowSignUp>
      {(user) => <StatusPage userId={user.id} />}
    </AuthGate>
  ),
});

function StatusPage({ userId }: { userId: string }) {
  const { id } = Route.useParams();
  const application = useQuery(applicationQuery(id));
  const history = useQuery(statusHistoryQuery(id));
  const interviews = useQuery(applicantInterviewsQuery(id));

  if (application.isLoading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full rounded-xl" />
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
  const app = application.data;
  if (!app) {
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

  const decided = app.status === "accepted" || app.status === "waitlisted" || app.status === "rejected";
  const reachedIndex = STATUS_TIMELINE.indexOf(app.status);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {app.student_first_name || app.student_last_name
              ? `${app.student_first_name ?? ""} ${app.student_last_name ?? ""}`.trim()
              : "Application"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {app.reference_code ? `Reference ${app.reference_code}` : "Reference issued on submission"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{STATUS_LABELS[app.status]}</Badge>
          {EDITABLE_STATUSES.includes(app.status) ? (
            <Button asChild size="sm">
              <Link to="/apply/application/$id" params={{ id: app.id }}>
                Continue editing
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <Link to="/apply">My applications</Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="timeline-heading" className="mt-10">
        <h2 id="timeline-heading" className="text-xl font-semibold">
          Progress
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-5">
          {STATUS_TIMELINE.map((status, index) => {
            const done = reachedIndex >= index || decided;
            return (
              <li
                key={status}
                className={`rounded-xl border p-3 text-sm ${done ? "border-secondary/40 bg-forest-soft" : "bg-card text-muted-foreground"}`}
              >
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}
                </span>
                {STATUS_LABELS[status]}
              </li>
            );
          })}
        </ol>
        {decided ? (
          <div className="mt-4 rounded-xl border bg-card p-4">
            <p className="font-medium">Decision: {STATUS_LABELS[app.status]}</p>
            {app.decision_note ? (
              <p className="mt-1 text-sm text-muted-foreground">{app.decision_note}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="interviews-heading" className="mt-10">
        <h2 id="interviews-heading" className="flex items-center gap-2 text-xl font-semibold">
          <CalendarClock className="size-5" aria-hidden="true" />
          Interviews
        </h2>
        {(interviews.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No interview has been scheduled yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {(interviews.data ?? []).map((interview) => (
              <li key={interview.id} className="rounded-xl border bg-card p-4 text-sm">
                <p className="font-medium">{new Date(interview.scheduled_at).toLocaleString()}</p>
                <p className="mt-1 text-muted-foreground">
                  {interview.mode}
                  {interview.location ? ` · ${interview.location}` : ""} · {interview.duration_minutes} minutes
                  {interview.interviewer_name ? ` · with ${interview.interviewer_name}` : ""}
                </p>
                <Badge className="mt-2" variant="secondary">
                  {interview.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="docs-heading" className="mt-10">
        <h2 id="docs-heading" className="text-xl font-semibold">
          Documents
        </h2>
        <div className="mt-4">
          <DocumentsPanel
            applicationId={app.id}
            userId={userId}
            periodId={app.period_id}
            gradeLevelId={app.grade_level_id}
            canUpload={EDITABLE_STATUSES.includes(app.status)}
          />
        </div>
      </section>

      <section aria-labelledby="history-heading" className="mt-10">
        <h2 id="history-heading" className="text-xl font-semibold">
          History
        </h2>
        {history.isLoading ? (
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        ) : (history.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing has changed yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {(history.data ?? []).map((entry) => (
              <li key={entry.id} className="rounded-lg border bg-card px-4 py-3 text-sm">
                <p className="font-medium">
                  {entry.from_status ? `${STATUS_LABELS[entry.from_status]} → ` : ""}
                  {STATUS_LABELS[entry.to_status]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Email notifications are not yet connected - updates appear in your portal notifications. Application fees are
        recorded in the system but online payment is not yet enabled.
      </p>
    </div>
  );
}
