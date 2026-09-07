import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Landmark,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminStatsQuery } from "@/lib/admissions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff dashboard - Cresta Reign Academy" },
      {
        name: "description",
        content: "Secure staff dashboard for Cresta Reign Academy content and admissions.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff dashboard - Cresta Reign Academy" },
      { property: "og:description", content: "Secure staff dashboard for content and admissions." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const stats = useQuery(adminStatsQuery());
  const submitted = stats.data?.byStatus.submitted ?? 0;
  const review = stats.data?.byStatus.under_review ?? 0;
  const accepted = stats.data?.byStatus.accepted ?? 0;
  const waitlisted = stats.data?.byStatus.waitlisted ?? 0;

  const modules = [
    {
      label: "Admissions",
      description: "Review applicants, interviews and physical document verification.",
      icon: ClipboardList,
      to: "/admin/admissions" as const,
      status: `${submitted + review} active`,
    },
    {
      label: "Students",
      description: "Student profiles, guardians, academic records and attendance.",
      icon: GraduationCap,
      status: "Workspace ready",
    },
    {
      label: "Finance",
      description: "Day-school fees, collections, balances and receipts.",
      icon: Landmark,
      status: "Workspace ready",
    },
    {
      label: "Academics",
      description: "Classes, subjects, assessment and report cards.",
      icon: CalendarDays,
      status: "Workspace ready",
    },
    {
      label: "People",
      description: "Teacher, staff and role administration.",
      icon: Users,
      status: "Workspace ready",
    },
    {
      label: "Inventory",
      description: "Assets, procurement requests and suppliers.",
      icon: Package,
      status: "Workspace ready",
    },
    {
      label: "Safeguarding",
      description: "Attendance alerts, behaviour and visitor security.",
      icon: ShieldCheck,
      status: "Workspace ready",
    },
    {
      label: "Wellbeing",
      description: "Health notes, support plans and pastoral follow-up.",
      icon: HeartPulse,
      status: "Workspace ready",
    },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">
            Principal command centre
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Good morning, Cresta Reign
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A single operating view for admissions, students, finance, academics and the everyday
            work of a secondary day school.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/admissions">
            Review admissions <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile
          label="Applications"
          value={submitted + review + accepted + waitlisted}
          detail={`${submitted} new`}
        />
        <Tile label="Under review" value={review} detail="Needs attention" />
        <Tile label="Accepted" value={accepted} detail="Ready for next steps" />
        <Tile label="Waitlisted" value={waitlisted} detail="Awaiting a decision" />
        <Tile
          label="Physical documents"
          value={stats.data?.pendingDocuments ?? 0}
          detail="To verify"
        />
      </div>

      <section className="mt-10" aria-labelledby="modules-heading">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="modules-heading" className="text-xl font-semibold">
              School operations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The OS modules are organised around the roles that keep the school moving.
            </p>
          </div>
          <Badge variant="secondary">Day school mode</Badge>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const content = (
              <div className="group h-full rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-secondary hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-forest-soft text-secondary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline">{module.status}</Badge>
                </div>
                <h3 className="mt-5 font-semibold text-primary">{module.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              </div>
            );
            return module.to ? (
              <Link key={module.label} to={module.to}>
                {content}
              </Link>
            ) : (
              <div key={module.label}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Today&apos;s priorities</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex items-center justify-between border-b pb-3">
              <span>Review newly submitted applications</span>
              <Badge>{submitted}</Badge>
            </li>
            <li className="flex items-center justify-between border-b pb-3">
              <span>Verify accepted-student documents</span>
              <Badge>{stats.data?.pendingDocuments ?? 0}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span>Confirm admissions configuration</span>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/admissions/settings">Open</Link>
              </Button>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-semibold text-primary">Cresta Reign operating principle</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Keep decisions human, records structured and every learner visible. Financial, academic
            and safeguarding actions should always be reviewable by authorised staff.
          </p>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
