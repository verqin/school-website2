import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, FilePlus2, FileText } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/site/states";
import {
  STATUS_LABELS,
  createApplication,
  markNotificationRead,
  myApplicationsQuery,
  notificationsQuery,
  periodsQuery,
  completionPercent,
} from "@/lib/admissions";

export const Route = createFileRoute("/apply/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Applicant portal — Sample1 School Admissions" },
      {
        name: "description",
        content: "Start, continue and track your Sample1 School application in the secure applicant portal.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Applicant portal — Sample1 School Admissions" },
      { property: "og:description", content: "Start, continue and track your Sample1 School application." },
    ],
  }),
  component: () => (
    <AuthGate
      title="Applicant sign in"
      description="Create an account or sign in to start and track your application."
      allowSignUp
    >
      {(user) => <Dashboard userId={user.id} email={user.email ?? ""} />}
    </AuthGate>
  ),
});

function Dashboard({ userId, email }: { userId: string; email: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const applications = useQuery(myApplicationsQuery());
  const periods = useQuery(periodsQuery());
  const notifications = useQuery(notificationsQuery());
  const [error, setError] = useState("");

  const start = useMutation({
    mutationFn: async () => {
      const activePeriod = periods.data?.[0]?.id ?? null;
      return createApplication(userId, activePeriod);
    },
    onSuccess: async (app) => {
      await queryClient.invalidateQueries({ queryKey: ["applications", "mine"] });
      void navigate({ to: "/apply/application/$id", params: { id: app.id } });
    },
    onError: (err: Error) => setError(err.message),
  });

  const unread = (notifications.data ?? []).filter((n) => !n.is_read);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My applications</h1>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <Button onClick={() => start.mutate()} disabled={start.isPending}>
          <FilePlus2 className="size-4" aria-hidden="true" />
          {start.isPending ? "Creating…" : "Start new application"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="apps-heading" className="mt-8">
        <h2 id="apps-heading" className="sr-only">
          Applications
        </h2>
        {applications.isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : applications.isError ? (
          <ErrorState onRetry={() => void applications.refetch()} />
        ) : (applications.data ?? []).length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Start an application to begin. Your progress is saved automatically as you type."
            icon={<FileText className="size-5" aria-hidden="true" />}
            action={<Button onClick={() => start.mutate()}>Start new application</Button>}
          />
        ) : (
          <ul className="grid gap-4">
            {(applications.data ?? []).map((app) => {
              const percent = completionPercent(app, 1);
              const editable = app.status === "draft" || app.status === "documents_requested";
              return (
                <li key={app.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {app.student_first_name || app.student_last_name
                            ? `${app.student_first_name ?? ""} ${app.student_last_name ?? ""}`.trim()
                            : "Untitled application"}
                        </h3>
                        <Badge variant={app.status === "draft" ? "secondary" : "default"}>
                          {STATUS_LABELS[app.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {app.reference_code ? `Reference ${app.reference_code}` : "Reference issued on submission"}
                        {" · "}
                        Updated {new Date(app.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {editable ? (
                        <Button asChild size="sm">
                          <Link to="/apply/application/$id" params={{ id: app.id }}>
                            Continue
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="outline">
                        <Link to="/apply/status/$id" params={{ id: app.id }}>
                          View status
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {app.status === "draft" ? (
                    <div className="mt-4">
                      <Progress value={percent} aria-label="Application completeness" />
                      <p className="mt-2 text-xs text-muted-foreground">{percent}% complete</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="notif-heading" className="mt-12">
        <h2 id="notif-heading" className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="size-5" aria-hidden="true" />
          Notifications
          {unread.length ? <Badge variant="secondary">{unread.length} new</Badge> : null}
        </h2>
        {notifications.isLoading ? (
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        ) : (notifications.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            You have no notifications yet. Updates about your application will appear here.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {(notifications.data ?? []).map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border p-4 ${n.is_read ? "bg-card" : "border-secondary/40 bg-forest-soft"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await markNotificationRead(n.id);
                        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
