import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, ClipboardPenLine, FilePlus2, Users } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Teacher portal - Cresta Reign Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthGate
      title="Teacher portal sign in"
      description="Access your assigned classes, attendance register, marks and assignments."
    >
      {() => <TeacherDashboard />}
    </AuthGate>
  ),
});

const learners = [
  ["Tendai Moyo", "Present", "82"],
  ["Rudo Chirwa", "Present", "76"],
  ["Kudzai Ncube", "Late", "64"],
  ["Nyasha Dube", "Present", "91"],
  ["Tatenda Sibanda", "Absent", "71"],
];

function TeacherDashboard() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">
            Teaching and learning
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Teacher dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your classes, attendance registers, assessment marks and learner support in one focused
            workspace.
          </p>
        </div>
        <Button>
          <FilePlus2 className="size-4" /> New assignment
        </Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Assigned classes" value="4" icon={Users} detail="Forms 2A–4B" />
        <Metric label="Attendance pending" value="2" icon={CalendarCheck} detail="Today" />
        <Metric
          label="Marks to enter"
          value="18"
          icon={ClipboardPenLine}
          detail="Term 2 assessments"
        />
        <Metric
          label="Active assignments"
          value="6"
          icon={BookOpen}
          detail="Across your subjects"
        />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Today&apos;s timetable</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["08:00", "Mathematics", "Form 2A", "Room 4"],
              ["10:15", "Mathematics", "Form 3B", "Room 7"],
              ["12:00", "Planning period", "Marking and resources", "Staff room"],
              ["14:00", "Mathematics", "Form 4A", "Room 2"],
            ].map(([time, subject, group, room]) => (
              <div
                key={`${time}-${group}`}
                className="flex gap-4 rounded-xl border bg-background p-3"
              >
                <span className="w-12 pt-0.5 text-xs font-semibold text-gold">{time}</span>
                <div>
                  <p className="font-medium text-primary">{subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {group} · {room}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Form 2A · Mathematics</h2>
              <p className="mt-1 text-sm text-muted-foreground">24 learners · 24 August 2026</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Save attendance</Button>
              <Button size="sm" variant="outline">
                Enter marks
              </Button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-medium">Learner</th>
                  <th className="px-3 py-3 font-medium">Attendance</th>
                  <th className="px-3 py-3 font-medium">Latest mark</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {learners.map(([name, status, mark]) => (
                  <tr key={name}>
                    <td className="px-3 py-4 font-medium text-primary">{name}</td>
                    <td className="px-3 py-4">
                      <Badge
                        variant={
                          status === "Present"
                            ? "secondary"
                            : status === "Late"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-3 py-4">{mark}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Teaching tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep learning activity moving across your assigned classes.
            </p>
          </div>
          <Button size="sm" variant="outline">
            View all
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Task title="Term 2 test marks" detail="Form 3B · due today" status="Pending" />
          <Task title="Algebra homework" detail="Form 2A · 24 submissions" status="Active" />
          <Task title="Lesson resource" detail="Upload revision guide" status="Draft" />
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <Icon className="size-4 text-secondary" aria-hidden="true" />
      <p className="mt-3 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
function Task({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-primary">{title}</p>
        <Badge variant="outline">{status}</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
