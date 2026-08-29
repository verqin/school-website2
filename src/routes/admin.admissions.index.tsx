import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/site/states";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  adminApplicationsQuery,
  adminStatsQuery,
  gradeLevelsQuery,
  periodsQuery,
  type AdminFilters,
  type ApplicationStatus,
} from "@/lib/admissions";

export const Route = createFileRoute("/admin/admissions/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admissions dashboard — Sample1 School Staff" },
      { name: "description", content: "Review, filter and progress Sample1 School applications." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admissions dashboard — Sample1 School Staff" },
      { property: "og:description", content: "Review, filter and progress applications." },
    ],
  }),
  component: AdmissionsDashboard,
});

function AdmissionsDashboard() {
  const { user } = useSupabaseUser();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [periodId, setPeriodId] = useState<string>("all");
  const [gradeLevelId, setGradeLevelId] = useState<string>("all");
  const [assignment, setAssignment] = useState<NonNullable<AdminFilters["assignment"]>>("all");
  const [page, setPage] = useState(0);
  const [submittedSearch, setSubmittedSearch] = useState("");

  const filters: AdminFilters = {
    search: submittedSearch,
    status,
    periodId,
    gradeLevelId,
    assignment,
    page,
    pageSize: 20,
    userId: user?.id ?? null,
  };

  const applications = useQuery(adminApplicationsQuery(filters));
  const stats = useQuery(adminStatsQuery());
  const periods = useQuery(periodsQuery());
  const grades = useQuery(gradeLevelsQuery());

  const total = applications.data?.count ?? 0;
  const pageSize = applications.data?.pageSize ?? 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold">Admissions</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Searching, filtering and paging all run in the database, so large intakes stay fast.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {(["submitted", "under_review", "interview_scheduled", "accepted"] as ApplicationStatus[]).map((key) => (
          <div key={key} className="rounded-xl border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{STATUS_LABELS[key]}</p>
            <p className="mt-1 text-2xl font-semibold">{stats.data?.byStatus[key] ?? 0}</p>
          </div>
        ))}
      </div>

      <form
        className="mt-8 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(0);
          setSubmittedSearch(search.trim().slice(0, 120));
        }}
      >
        <div className="grid gap-2 lg:col-span-2">
          <Label htmlFor="admissions-search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="admissions-search"
              value={search}
              maxLength={120}
              placeholder="Reference, student or guardian"
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="outline" aria-label="Search applications">
              <Search className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <SelectField
          id="filter-status"
          label="Status"
          value={status}
          onChange={(value) => {
            setPage(0);
            setStatus(value as ApplicationStatus | "all");
          }}
          options={[
            { value: "all", label: "All statuses" },
            ...APPLICATION_STATUSES.filter((s) => s !== "draft").map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
        />
        <SelectField
          id="filter-period"
          label="Intake"
          value={periodId}
          onChange={(value) => {
            setPage(0);
            setPeriodId(value);
          }}
          options={[
            { value: "all", label: "All intakes" },
            ...(periods.data ?? []).map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <SelectField
          id="filter-grade"
          label="Grade"
          value={gradeLevelId}
          onChange={(value) => {
            setPage(0);
            setGradeLevelId(value);
          }}
          options={[
            { value: "all", label: "All grades" },
            ...(grades.data ?? []).map((g) => ({ value: g.id, label: g.name })),
          ]}
        />
        <SelectField
          id="filter-assignment"
          label="Assignment"
          value={assignment}
          onChange={(value) => {
            setPage(0);
            setAssignment(value as NonNullable<AdminFilters["assignment"]>);
          }}
          options={[
            { value: "all", label: "Everyone" },
            { value: "mine", label: "Assigned to me" },
            { value: "unassigned", label: "Unassigned" },
          ]}
        />
      </form>

      <div className="mt-8">
        {applications.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : applications.isError ? (
          <ErrorState onRetry={() => void applications.refetch()} />
        ) : (applications.data?.rows ?? []).length === 0 ? (
          <EmptyState title="No applications match these filters" description="Try widening your search." />
        ) : (
          <ul className="grid gap-3">
            {(applications.data?.rows ?? []).map((app) => (
              <li key={app.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {`${app.student_first_name ?? ""} ${app.student_last_name ?? ""}`.trim() || "Unnamed student"}
                      </p>
                      <Badge>{STATUS_LABELS[app.status]}</Badge>
                      {app.assigned_to ? <Badge variant="secondary">Assigned</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {app.reference_code ?? "No reference"} · {app.guardian_name ?? "No guardian"} ·{" "}
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Not submitted"}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/admin/admissions/$id" params={{ id: app.id }}>
                      Review
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {total} application{total === 1 ? "" : "s"} · page {page + 1} of {pages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="h-10 rounded-md border bg-background px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
