import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Landmark,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundCheck,
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
  const [role, setRole] = useState<StaffRole>("Principal");
  const roleFocus = roleFocusMap[role];
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

      <section className="mt-8 rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[var(--shadow-elite)] backdrop-blur-xl" aria-labelledby="role-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold">Role-aware workspace</p>
            <h2 id="role-heading" className="mt-1 text-xl font-semibold">{roleFocus.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{roleFocus.description}</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Preview staff role">
            {staffRoles.map((staffRole) => (
              <Button key={staffRole} size="sm" variant={role === staffRole ? "default" : "outline"} onClick={() => setRole(staffRole)}>
                {staffRole}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {roleFocus.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border bg-card/80 p-4">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Operational pulse</h2><Activity className="size-4 text-secondary" aria-hidden="true" /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Pulse label="Attendance today" value="94.8%" detail="+2.4% versus last week" tone="positive" />
            <Pulse label="Academic average" value="72.6%" detail="Across active classes" tone="positive" />
            <Pulse label="Open actions" value="18" detail="5 require principal review" tone="attention" />
            <Pulse label="System health" value="100%" detail="All core services responding" tone="positive" />
          </div>
        </div>
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-secondary" aria-hidden="true" /><h2 className="font-semibold">Advisory intelligence</h2></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Three Form 3 classes are trending above the school average. Review attendance and assessment evidence before making any learner decision.</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-secondary"><CheckCircle2 className="size-4" /> Human review required for every consequential action</div>
        </div>
      </section>

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

type StaffRole = "Principal" | "Bursar" | "Teacher" | "Receptionist" | "Storekeeper";

const staffRoles: StaffRole[] = ["Principal", "Bursar", "Teacher", "Receptionist", "Storekeeper"];

const roleFocusMap: Record<StaffRole, { title: string; description: string; metrics: { label: string; value: string; detail: string }[] }> = {
  Principal: { title: "Whole-school oversight", description: "Enrollment, attendance, academics, finance and safeguarding in one accountable view.", metrics: [{ label: "Students", value: "684", detail: "Active day students" }, { label: "Staff", value: "48", detail: "Across 6 departments" }, { label: "Alerts", value: "9", detail: "Require review" }] },
  Bursar: { title: "Finance workspace", description: "Collections, outstanding balances and reconciliation without exposing academic records.", metrics: [{ label: "Collected", value: "$42.8k", detail: "This term" }, { label: "Outstanding", value: "$8.4k", detail: "Across 126 accounts" }, { label: "Flagged", value: "4", detail: "Need reconciliation" }] },
  Teacher: { title: "Teaching day", description: "Assigned classes, attendance tasks, marks and assessments for the classes you teach.", metrics: [{ label: "Classes", value: "4", detail: "Assigned this term" }, { label: "Pending marks", value: "12", detail: "Across 2 assessments" }, { label: "Attendance", value: "2", detail: "Tasks today" }] },
  Receptionist: { title: "Front office", description: "Visitors, enquiries and application lookup with sensitive finance and academic data kept private.", metrics: [{ label: "Inside", value: "7", detail: "Visitors currently on site" }, { label: "Expected", value: "11", detail: "Due today" }, { label: "Enquiries", value: "14", detail: "New this week" }] },
  Storekeeper: { title: "Stock and procurement", description: "Inventory levels, purchase requests, suppliers and expected deliveries.", metrics: [{ label: "Stock lines", value: "238", detail: "Across 12 categories" }, { label: "Low stock", value: "8", detail: "Need reorder" }, { label: "Requests", value: "5", detail: "Awaiting approval" }] },
};

function Pulse({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "positive" | "attention" }) {
  return <div className="rounded-2xl bg-muted/60 p-4"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{label}</p><span className={tone === "positive" ? "size-2 rounded-full bg-secondary" : "size-2 rounded-full bg-gold"} aria-hidden="true" /></div><p className="mt-2 text-2xl font-semibold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
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
