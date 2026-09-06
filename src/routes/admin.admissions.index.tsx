import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/site/states";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { APPLICATION_STATUSES, STATUS_LABELS, adminApplicationsQuery, adminStatsQuery, gradeLevelsQuery, periodsQuery, type AdminFilters, type ApplicationStatus } from "@/lib/admissions";

export const Route = createFileRoute("/admin/admissions/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admissions command center - Cresta Reign Academy" }, { name: "description", content: "Review, filter and progress Cresta Reign Academy applications." }, { name: "robots", content: "noindex" }] }),
  component: AdmissionsDashboard,
});

function exportRows(rows: Array<Record<string, unknown>>) {
  const headers = ["Reference", "Student", "Guardian", "Email", "Status", "Submitted"];
  const values = rows.map((row) => [row.reference_code, `${row.student_first_name ?? ""} ${row.student_last_name ?? ""}`.trim(), row.guardian_name, row.guardian_email, row.status, row.submitted_at]);
  const csv = [headers, ...values].map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "cresta-reign-admissions.csv"; anchor.click(); URL.revokeObjectURL(url);
}

function AdmissionsDashboard() {
  const { user } = useSupabaseUser();
  const [search, setSearch] = useState(""); const [status, setStatus] = useState<ApplicationStatus | "all">("all"); const [periodId, setPeriodId] = useState("all"); const [gradeLevelId, setGradeLevelId] = useState("all"); const [assignment, setAssignment] = useState<NonNullable<AdminFilters["assignment"]>>("all"); const [page, setPage] = useState(0); const [submittedSearch, setSubmittedSearch] = useState("");
  const filters: AdminFilters = { search: submittedSearch, status, periodId, gradeLevelId, assignment, page, pageSize: 20, userId: user?.id ?? null };
  const applications = useQuery(adminApplicationsQuery(filters)); const stats = useQuery(adminStatsQuery()); const periods = useQuery(periodsQuery()); const grades = useQuery(gradeLevelsQuery());
  const total = applications.data?.count ?? 0; const pageSize = applications.data?.pageSize ?? 20; const pages = Math.max(1, Math.ceil(total / pageSize)); const rows = applications.data?.rows ?? [];
  const statKeys = ["submitted", "under_review", "interview_scheduled", "accepted"] as ApplicationStatus[];
  const maxStat = Math.max(1, ...statKeys.map((key) => stats.data?.byStatus[key] ?? 0));

  return <div className="container-page py-10">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Staff command center</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Admissions, with clarity.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A calm operating view for every applicant, intake and decision.</p></div><Button variant="outline" onClick={() => exportRows(rows)} disabled={!rows.length}><Download data-icon="inline-start" /> Export current page</Button></div>
    <div className="mt-8 grid gap-4 md:grid-cols-4">{statKeys.map((key) => { const value = stats.data?.byStatus[key] ?? 0; return <div key={key} className="glass-panel p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{STATUS_LABELS[key]}</p><Sparkles className="size-4 text-accent" aria-hidden="true" /></div><p className="mt-3 text-3xl font-semibold">{value}</p><div className="mt-4 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(8, (value / maxStat) * 100)}%` }} /></div></div>; })}</div>
    <form className="glass-panel mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(event) => { event.preventDefault(); setPage(0); setSubmittedSearch(search.trim().slice(0, 120)); }}><div className="grid gap-2 lg:col-span-2"><Label htmlFor="admissions-search">Search applicants</Label><div className="flex gap-2"><Input id="admissions-search" value={search} maxLength={120} placeholder="Reference, student or guardian" onChange={(event) => setSearch(event.target.value)} /><Button type="submit" variant="outline" aria-label="Search applications"><Search data-icon="inline-start" /></Button></div></div><SelectField id="filter-status" label="Status" value={status} onChange={(value) => { setPage(0); setStatus(value as ApplicationStatus | "all"); }} options={[{ value: "all", label: "All statuses" }, ...APPLICATION_STATUSES.filter((s) => s !== "draft").map((s) => ({ value: s, label: STATUS_LABELS[s] }))]} /><SelectField id="filter-period" label="Intake" value={periodId} onChange={(value) => { setPage(0); setPeriodId(value); }} options={[{ value: "all", label: "All intakes" }, ...(periods.data ?? []).map((p) => ({ value: p.id, label: p.name }))]} /><SelectField id="filter-grade" label="Grade" value={gradeLevelId} onChange={(value) => { setPage(0); setGradeLevelId(value); }} options={[{ value: "all", label: "All grades" }, ...(grades.data ?? []).map((g) => ({ value: g.id, label: g.name }))]} /><SelectField id="filter-assignment" label="Assignment" value={assignment} onChange={(value) => { setPage(0); setAssignment(value as NonNullable<AdminFilters["assignment"]>); }} options={[{ value: "all", label: "Everyone" }, { value: "mine", label: "Assigned to me" }, { value: "unassigned", label: "Unassigned" }]} /></form>
    <div className="mt-8">{applications.isLoading ? <div className="grid gap-3"><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></div> : applications.isError ? <ErrorState onRetry={() => void applications.refetch()} /> : !rows.length ? <EmptyState title="No applications match these filters" description="Try widening your search." /> : <ul className="grid gap-3">{rows.map((app) => <li key={app.id} className="glass-panel p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{`${app.student_first_name ?? ""} ${app.student_last_name ?? ""}`.trim() || "Unnamed student"}</p><Badge>{STATUS_LABELS[app.status]}</Badge>{app.assigned_to ? <Badge variant="secondary">Assigned</Badge> : null}</div><p className="mt-1 text-sm text-muted-foreground">{app.reference_code ?? "No reference"} · {app.guardian_name ?? "No guardian"} · {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Not submitted"}</p></div><Button asChild size="sm"><Link to="/admin/admissions/$id" params={{ id: app.id }}>Review</Link></Button></div></li>)}</ul>}</div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-muted-foreground">{total} application{total === 1 ? "" : "s"} · page {page + 1} of {pages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div>
  </div>;
}
function SelectField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><select id={id} className="h-10 rounded-md border bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }
