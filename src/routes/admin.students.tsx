import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/admin/students")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Student information - Cresta Reign Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: StudentInformation,
});

function StudentInformation() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const studentsQuery = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_no, first_name, last_name, status, admission_date, previous_school, grade_levels(name), classes:current_class_id(name, stream)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const gradesQuery = useQuery({
    queryKey: ["grade-levels"],
    queryFn: async () => (await supabase.from("grade_levels").select("id, name").order("name")).data ?? [],
  });

  const rows = (studentsQuery.data ?? []).map((s) => {
    const cls = s.classes as { name: string; stream: string | null } | null;
    const grade = s.grade_levels as { name: string } | null;
    return {
      id: s.id,
      number: s.student_no,
      name: `${s.first_name} ${s.last_name}`,
      klass: cls ? `${cls.name}${cls.stream ? ` ${cls.stream}` : ""}` : grade?.name ?? "Not assigned",
      admitted: s.admission_date ?? "",
      previous: s.previous_school ?? "",
      status: s.status as string,
    };
  });
  const filtered = rows.filter((r) => `${r.name} ${r.number} ${r.klass}`.toLowerCase().includes(search.toLowerCase()));
  const active = rows.filter((r) => r.status === "active" || r.status === "enrolled").length;

  const add = useMutation({
    mutationFn: async (v: { first_name: string; last_name: string; date_of_birth: string; gender: string; grade_level_id: string; previous_school: string }) => {
      const { data: no, error: noErr } = await supabase.rpc("next_student_number");
      if (noErr) throw noErr;
      const { error } = await supabase.from("students").insert({
        student_no: no,
        first_name: v.first_name,
        last_name: v.last_name,
        date_of_birth: v.date_of_birth || null,
        gender: v.gender || null,
        grade_level_id: v.grade_level_id || null,
        previous_school: v.previous_school || null,
        admission_date: new Date().toISOString().slice(0, 10),
        status: "enrolled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student added to the register");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: () => toast.error("Could not add the student. You may not have permission."),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim().slice(0, 120);
    if (!g("first_name") || !g("last_name")) return toast.error("First and last name are required");
    add.mutate({ first_name: g("first_name"), last_name: g("last_name"), date_of_birth: g("date_of_birth"), gender: g("gender"), grade_level_id: g("grade_level_id"), previous_school: g("previous_school") });
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">Student information management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">Student register</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every learner has one day-student profile. Accepted applicants can also be enrolled from their application.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Add student</Button>
          <Button variant="outline" disabled={!filtered.length} onClick={() => downloadCsv("students.csv", ["Student number", "Name", "Class", "Admitted", "Previous school", "Status"], filtered.map((r) => [r.number, r.name, r.klass, r.admitted, r.previous, r.status]))}>
            <Download data-icon="inline-start" />Export
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Summary label="Learners on register" value={String(rows.length)} detail="All statuses" />
        <Summary label="Enrolled / active" value={String(active)} detail="Currently attending" />
        <Summary label="Without a class" value={String(rows.filter((r) => r.klass === "Not assigned").length)} detail="Need class allocation" />
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Learner profiles</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search by name, student number or class.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Search students" aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">Student</th>
                <th className="px-3 py-3 font-medium">Class / form</th>
                <th className="px-3 py-3 font-medium">Admitted</th>
                <th className="px-3 py-3 font-medium">Previous school</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {studentsQuery.isLoading && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Loading students...</td></tr>}
              {studentsQuery.error && <tr><td colSpan={5} className="px-3 py-8 text-center text-destructive">Could not load students. Check your permissions.</td></tr>}
              {!studentsQuery.isLoading && !studentsQuery.error && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">{search ? "No students match your search." : "No students yet. Add a student or enrol an accepted applicant."}</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="transition hover:bg-muted/40">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-forest-soft text-secondary"><UserRound className="size-4" aria-hidden="true" /></span>
                      <div><p className="font-medium text-primary">{s.name}</p><p className="text-xs text-muted-foreground">{s.number}</p></div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{s.klass}</td>
                  <td className="px-3 py-4">{s.admitted}</td>
                  <td className="px-3 py-4">{s.previous}</td>
                  <td className="px-3 py-4"><Badge variant={s.status === "suspended" ? "destructive" : "secondary"} className="capitalize">{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add student</DialogTitle></DialogHeader>
          <form id="add-student" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <Field name="first_name" label="First name *" />
            <Field name="last_name" label="Last name *" />
            <Field name="date_of_birth" label="Date of birth" type="date" />
            <div className="grid gap-1.5">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="">Not specified</option><option>Female</option><option>Male</option>
              </select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="grade_level_id">Form / grade</Label>
              <select id="grade_level_id" name="grade_level_id" className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="">Not assigned</option>
                {(gradesQuery.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><Field name="previous_school" label="Previous school" /></div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="add-student" disabled={add.isPending}>{add.isPending ? "Saving..." : "Add student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} maxLength={120} />
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
