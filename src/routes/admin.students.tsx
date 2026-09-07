import { createFileRoute } from "@tanstack/react-router";
import { Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/students")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Student information - Cresta Reign Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentInformation,
});

const students = [
  {
    number: "CRA-2026-0001",
    name: "Tendai Moyo",
    grade: "Form 2A",
    attendance: "96%",
    average: "82.4%",
    status: "Active",
  },
  {
    number: "CRA-2026-0002",
    name: "Rudo Chirwa",
    grade: "Form 3B",
    attendance: "91%",
    average: "78.8%",
    status: "Active",
  },
  {
    number: "CRA-2026-0003",
    name: "Kudzai Ncube",
    grade: "Form 1C",
    attendance: "79%",
    average: "64.2%",
    status: "Needs support",
  },
  {
    number: "CRA-2026-0004",
    name: "Nyasha Dube",
    grade: "Form 4A",
    attendance: "94%",
    average: "88.1%",
    status: "Active",
  },
  {
    number: "CRA-2026-0005",
    name: "Tatenda Sibanda",
    grade: "Form 2B",
    attendance: "86%",
    average: "71.5%",
    status: "Active",
  },
];

function StudentInformation() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">
            Student information management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Student register
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every learner has one day-student profile connecting guardians, academics, attendance,
            behaviour and physical documents.
          </p>
        </div>
        <Badge variant="secondary">Day school register</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Summary label="Enrolled learners" value="1,284" detail="Across Forms 1–6" />
        <Summary label="Attendance below 80%" value="18" detail="Pastoral follow-up" />
        <Summary label="Profiles needing documents" value="27" detail="Physical verification" />
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Learner profiles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search by name, student number or class.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input className="pl-9" placeholder="Search students" aria-label="Search students" />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">Student</th>
                <th className="px-3 py-3 font-medium">Class</th>
                <th className="px-3 py-3 font-medium">Attendance</th>
                <th className="px-3 py-3 font-medium">Average</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.number} className="transition hover:bg-muted/40">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-forest-soft text-secondary">
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-medium text-primary">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{student.grade}</td>
                  <td
                    className={`px-3 py-4 font-medium ${student.attendance === "79%" ? "text-destructive" : "text-primary"}`}
                  >
                    {student.attendance}
                  </td>
                  <td className="px-3 py-4">{student.average}</td>
                  <td className="px-3 py-4">
                    <Badge
                      variant={student.status === "Needs support" ? "destructive" : "secondary"}
                    >
                      {student.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-sm leading-6 text-muted-foreground">
        Student records are designed to hold guardian contacts, previous schools, marks, reports,
        attendance events, behaviour notes and physical document verification without introducing
        boarding allocation fields.
      </div>
    </div>
  );
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
