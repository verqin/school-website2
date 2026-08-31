import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/site/states";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  addInternalNote,
  adminAuditQuery,
  adminInterviewsQuery,
  adminNotesQuery,
  applicationDocumentsQuery,
  applicationQuery,
  assignApplication,
  documentRequestsQuery,
  formDataValue,
  gradeLevelsQuery,
  recordInterviewOutcome,
  requestDocuments,
  scheduleInterview,
  setApplicationStatus,
  signedDocumentUrl,
  staffDirectoryQuery,
  statusHistoryQuery,
  verifyDocument,
  type Application,
  type ApplicationStatus,
} from "@/lib/admissions";

export const Route = createFileRoute("/admin/admissions/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Application review - Sample1 School Staff" },
      { name: "description", content: "Review an application, verify documents, schedule interviews and record decisions." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Application review - Sample1 School Staff" },
      { property: "og:description", content: "Review applications, documents, interviews and decisions." },
    ],
  }),
  component: ReviewRoute,
});

function ReviewRoute() {
  const { id } = Route.useParams();
  const { user } = useSupabaseUser();
  const application = useQuery(applicationQuery(id));

  if (application.isLoading || !user) {
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
  if (!application.data) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Application not found"
          description="It may have been withdrawn, or you may not have access to it."
          action={
            <Button asChild>
              <Link to="/admin/admissions">Back to admissions</Link>
            </Button>
          }
        />
      </div>
    );
  }
  return <Review app={application.data} staffId={user.id} />;
}

function Review({ app, staffId }: { app: Application; staffId: string }) {
  const queryClient = useQueryClient();
  const documents = useQuery(applicationDocumentsQuery(app.id));
  const requests = useQuery(documentRequestsQuery(app.id));
  const notes = useQuery(adminNotesQuery(app.id));
  const interviews = useQuery(adminInterviewsQuery(app.id));
  const history = useQuery(statusHistoryQuery(app.id));
  const audit = useQuery(adminAuditQuery(app.id));
  const grades = useQuery(gradeLevelsQuery());
  const reviewers = useQuery(staffDirectoryQuery());

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [docMessage, setDocMessage] = useState("");

  async function run(action: () => Promise<unknown>, keys: string[][]) {
    setBusy(true);
    setError("");
    try {
      await action();
      for (const key of keys) await queryClient.invalidateQueries({ queryKey: key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const refreshApp = () => [
    ["applications", "detail", app.id],
    ["admin", "applications"],
    ["applications", "history", app.id],
    ["admin", "audit", app.id],
  ];

  return (
    <div className="container-page py-10">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/admissions">← Back to admissions</Link>
      </Button>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {`${app.student_first_name ?? ""} ${app.student_last_name ?? ""}`.trim() || "Unnamed student"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {app.reference_code ?? "No reference"} ·{" "}
            {app.submitted_at ? `Submitted ${new Date(app.submitted_at).toLocaleString()}` : "Not submitted"}
          </p>
        </div>
        <Badge>{STATUS_LABELS[app.status]}</Badge>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Panel title="Applicant details">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Item label="Date of birth" value={app.student_dob ?? "-"} />
              <Item label="Gender" value={formDataValue(app, "gender") || "-"} />
              <Item label="Nationality" value={formDataValue(app, "nationality") || "-"} />
              <Item label="Home address" value={formDataValue(app, "home_address") || "-"} />
              <Item label="Guardian" value={app.guardian_name ?? "-"} />
              <Item label="Guardian email" value={app.guardian_email ?? "-"} />
              <Item label="Guardian phone" value={app.guardian_phone ?? "-"} />
              <Item
                label="Grade applied for"
                value={grades.data?.find((g) => g.id === app.grade_level_id)?.name ?? "-"}
              />
              <Item label="Previous school" value={formDataValue(app, "previous_school") || "-"} />
              <Item label="Previous grade" value={formDataValue(app, "previous_grade") || "-"} />
              <Item label="Achievements" value={formDataValue(app, "achievements") || "-"} />
              <Item label="Support needs" value={formDataValue(app, "medical_notes") || "-"} />
            </dl>
          </Panel>

          <Panel title="Documents">
            {documents.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (documents.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <ul className="grid gap-3">
                {(documents.data ?? []).map((doc) => (
                  <li key={doc.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        className="text-sm underline-offset-4 hover:underline"
                        onClick={async () => {
                          try {
                            const url = await signedDocumentUrl(doc.storage_path);
                            window.open(url, "_blank", "noopener,noreferrer");
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Could not open the file.");
                          }
                        }}
                      >
                        {doc.file_name}
                      </button>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            void run(() => verifyDocument(doc.id, "verified"), [
                              ["applications", "documents", app.id],
                            ])
                          }
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => {
                            const reason = window.prompt("Reason for rejecting this document?") ?? "";
                            if (!reason.trim()) return;
                            void run(() => verifyDocument(doc.id, "rejected", reason.slice(0, 400)), [
                              ["applications", "documents", app.id],
                            ]);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                    {doc.rejection_reason ? (
                      <p className="mt-2 text-xs text-destructive">{doc.rejection_reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            <form
              className="mt-6 grid gap-3 rounded-lg border bg-muted/40 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!docLabel.trim()) return;
                void run(
                  () =>
                    requestDocuments({
                      applicationId: app.id,
                      applicantUserId: app.applicant_user_id,
                      label: docLabel,
                      message: docMessage,
                      staffId,
                    }),
                  [["applications", "doc-requests", app.id], ...refreshApp()],
                ).then(() => {
                  setDocLabel("");
                  setDocMessage("");
                });
              }}
            >
              <p className="text-sm font-medium">Request additional documents</p>
              <div className="grid gap-2">
                <Label htmlFor="doc-label">What is needed</Label>
                <Input
                  id="doc-label"
                  value={docLabel}
                  maxLength={160}
                  onChange={(event) => setDocLabel(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-message">Message to the applicant</Label>
                <Textarea
                  id="doc-message"
                  rows={2}
                  maxLength={1000}
                  value={docMessage}
                  onChange={(event) => setDocMessage(event.target.value)}
                />
              </div>
              <Button type="submit" size="sm" disabled={busy}>
                Send request
              </Button>
              {(requests.data ?? []).length ? (
                <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
                  {(requests.data ?? []).map((r) => (
                    <li key={r.id}>
                      {r.label} - {r.resolved_at ? "resolved" : "outstanding"}
                    </li>
                  ))}
                </ul>
              ) : null}
            </form>
          </Panel>

          <Panel title="Interviews">
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const scheduledAt = String(form.get("scheduled_at") ?? "");
                if (!scheduledAt) return;
                void run(
                  () =>
                    scheduleInterview({
                      applicationId: app.id,
                      applicantUserId: app.applicant_user_id,
                      staffId,
                      scheduledAt,
                      mode: String(form.get("mode") ?? "in_person"),
                      location: String(form.get("location") ?? ""),
                      interviewerName: String(form.get("interviewer") ?? ""),
                      durationMinutes: Number(form.get("duration") ?? 30),
                    }),
                  [["admin", "interviews", app.id], ...refreshApp()],
                );
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="scheduled_at">Date and time</Label>
                <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" min={10} max={240} defaultValue={30} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mode">Mode</Label>
                <select id="mode" name="mode" className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location or link</Label>
                <Input id="location" name="location" maxLength={200} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="interviewer">Interviewer name</Label>
                <Input id="interviewer" name="interviewer" maxLength={120} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="sm" disabled={busy}>
                  Schedule interview
                </Button>
              </div>
            </form>

            {(interviews.data ?? []).length ? (
              <ul className="mt-6 grid gap-3">
                {(interviews.data ?? []).map((interview) => (
                  <li key={interview.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{new Date(interview.scheduled_at).toLocaleString()}</p>
                    <p className="text-muted-foreground">
                      {interview.mode}
                      {interview.location ? ` · ${interview.location}` : ""} · {interview.status}
                    </p>
                    {interview.outcome ? <p className="mt-1">Outcome: {interview.outcome}</p> : null}
                    {interview.staff_notes ? (
                      <p className="mt-1 text-xs text-muted-foreground">Notes: {interview.staff_notes}</p>
                    ) : null}
                    {interview.status === "scheduled" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        disabled={busy}
                        onClick={() => {
                          const outcome = window.prompt("Interview outcome?") ?? "";
                          if (!outcome.trim()) return;
                          const staffNotes = window.prompt("Internal notes (optional)") ?? "";
                          void run(
                            () =>
                              recordInterviewOutcome(interview.id, app.id, staffId, outcome, staffNotes),
                            [["admin", "interviews", app.id], ["admin", "audit", app.id]],
                          );
                        }}
                      >
                        Record outcome
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No interviews scheduled yet.</p>
            )}
          </Panel>

          <Panel title="Internal notes">
            <p className="text-xs text-muted-foreground">
              Notes are visible to staff only - applicants can never read them.
            </p>
            <form
              className="mt-3 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!note.trim()) return;
                void run(() => addInternalNote(app.id, staffId, note), [
                  ["admin", "notes", app.id],
                  ["admin", "audit", app.id],
                ]).then(() => setNote(""));
              }}
            >
              <Textarea
                aria-label="Internal note"
                rows={3}
                maxLength={4000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <div>
                <Button type="submit" size="sm" disabled={busy}>
                  Add note
                </Button>
              </div>
            </form>
            {(notes.data ?? []).length ? (
              <ul className="mt-4 grid gap-2">
                {(notes.data ?? []).map((entry) => (
                  <li key={entry.id} className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p>{entry.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel title="Status & decision">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="status-select">Set status</Label>
                <select
                  id="status-select"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
                >
                  {APPLICATION_STATUSES.filter((s) => s !== "draft").map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status-note">Note to the applicant (optional)</Label>
                <Textarea
                  id="status-note"
                  rows={2}
                  maxLength={1000}
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                />
              </div>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run(
                    () => setApplicationStatus(app.id, status, statusNote.trim() || undefined),
                    refreshApp(),
                  ).then(() => setStatusNote(""))
                }
              >
                Update status
              </Button>
            </div>
          </Panel>

          <Panel title="Assignment">
            <select
              aria-label="Assign reviewer"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={app.assigned_to ?? ""}
              onChange={(event) =>
                void run(
                  () => assignApplication(app.id, staffId, event.target.value || null),
                  refreshApp(),
                )
              }
            >
              <option value="">Unassigned</option>
              {(reviewers.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Panel>

          <Panel title="Payment">
            <p className="text-sm text-muted-foreground">
              Fee status: <span className="font-medium">{app.payment_status}</span>. Online payment is not connected
              yet - the schema records fees so a provider can be added without data migration.
            </p>
          </Panel>

          <Panel title="Status history">
            <ul className="grid gap-2 text-sm">
              {(history.data ?? []).map((entry) => (
                <li key={entry.id}>
                  {STATUS_LABELS[entry.to_status]} ·{" "}
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
              {(history.data ?? []).length === 0 ? (
                <li className="text-muted-foreground">No changes yet.</li>
              ) : null}
            </ul>
          </Panel>

          <Panel title="Audit log">
            <ul className="grid gap-2 text-xs text-muted-foreground">
              {(audit.data ?? []).map((entry) => (
                <li key={entry.id}>
                  {entry.action} · {new Date(entry.created_at).toLocaleString()}
                </li>
              ))}
              {(audit.data ?? []).length === 0 ? <li>No activity recorded.</li> : null}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
