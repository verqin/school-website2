import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  GraduationCap,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/parent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parent portal - Cresta Reign Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthGate
      title="Parent portal sign in"
      description="Access your children's attendance, academic progress and fee statements."
    >
      {() => <ParentDashboard />}
    </AuthGate>
  ),
});

function ParentDashboard() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">
            Family partnership
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Parent dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A clear view of your child&apos;s school day, academic progress and account.
          </p>
        </div>
        <Button variant="outline">
          <MessageSquare className="size-4" /> Contact school
        </Button>
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-forest-soft text-secondary">
              <GraduationCap className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-primary">Tendai Moyo</h2>
              <p className="text-sm text-muted-foreground">Form 2A · CRA-2026-0001 · Day student</p>
            </div>
          </div>
          <Badge>Active learner</Badge>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Quick label="Attendance" value="96%" icon={CalendarDays} />
          <Quick label="Academic average" value="82.4%" icon={TrendingUp} />
          <Quick label="Fee balance" value="$175" icon={CircleDollarSign} />
          <Quick label="Reports" value="3" icon={FileText} />
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Academic performance</h2>
              <p className="mt-1 text-sm text-muted-foreground">Term 2 subject snapshot</p>
            </div>
            <Button variant="ghost" size="sm">
              View report
            </Button>
          </div>
          <div className="mt-5 grid gap-4">
            {[
              ["Mathematics", "88%"],
              ["English", "84%"],
              ["Science", "81%"],
              ["History", "76%"],
            ].map(([subject, mark]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm">
                  <span>{subject}</span>
                  <span className="font-medium text-primary">{mark}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-secondary" style={{ width: mark }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="size-5 text-gold" />
            <h2 className="font-semibold">Fee statement</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The current account includes tuition, development levy, ICT and sports for Term 2.
          </p>
          <div className="mt-5 flex items-end justify-between border-b border-gold/20 pb-4">
            <span className="text-sm text-muted-foreground">Outstanding balance</span>
            <span className="text-3xl font-semibold text-primary">$175</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm">Make payment</Button>
            <Button size="sm" variant="outline">
              Download statement
            </Button>
          </div>
        </section>
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">School updates</h2>
            <p className="mt-1 text-sm text-muted-foreground">Important notices for your family</p>
          </div>
          <Badge variant="secondary">2 new</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Notice title="Parent-teacher consultations" detail="Friday, 28 August · Main hall" />
          <Notice
            title="Term 2 report card available"
            detail="View Tendai's latest report and teacher comments"
          />
        </div>
      </section>
    </div>
  );
}

function Quick({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <Icon className="size-4 text-secondary" aria-hidden="true" />
      <p className="mt-3 text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Notice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
      <CheckCircle2 className="mt-0.5 size-4 text-secondary" aria-hidden="true" />
      <div>
        <p className="font-medium text-primary">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
