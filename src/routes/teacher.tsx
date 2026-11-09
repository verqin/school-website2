import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { BookOpen, CalendarCheck, ClipboardPenLine, FilePlus2, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ManualButton } from "@/components/ManualView";
import { teacherManual } from "@/lib/manuals";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Teacher portal - Cresta Reign Academy" },
      { name: "description", content: "Registers, marks and classes for Cresta Reign Academy teachers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthGate
      title="Teacher portal sign in"
      description="Access your assigned classes, attendance register and marks."
      allowSignUp
    >
      {(user) => <TeacherDashboard user={user} />}
    </AuthGate>
  ),
});

type Status = "present" | "absent" | "late" | "excused";
type ClassOption = { key: string; classId: string; subjectId: string | null; yearId: string | null; label: string };

const today = () => new Date().toISOString().slice(0, 10);

function TeacherDashboard({ user }: { user: User }) {
  const qc = useQueryClient();
  const portal = useQuery({
    queryKey: ["teacher-portal", user.id],
    queryFn: async () => {
      await supabase.rpc("claim_portal_links");
      const { data: staff } = await supabase.from("staff").select("id, full_name").eq("user_id", user.id).maybeSingle();
      if (!staff) return { staff: null, options: [] as ClassOption[] };
      const [{ data: asg }, { data: own }] = await Promise.all([
        supabase.from("teacher_subject_assignments").select("class_id, subject_id, academic_year_id, classes(name, stream), subjects(name)").eq("staff_id", staff.id),
        supabase.from("classes").select("id, name, stream, academic_year_id").eq("class_teacher_id", staff.id),
      ]);
      const options: ClassOption[] = [];
      for (const a of asg ?? []) {
        const c = a.classes as { name: string; stream: string | null } | null;
        const s = a.subjects as { name: string } | null;
        options.push({ key: `${a.class_id}-${a.subject_id}`, classId: a.class_id, subjectId: a.subject_id, yearId: a.academic_year_id, label: `${c?.name ?? "Class"}${c?.stream ? ` ${c.stream}` : ""} - ${s?.name ?? "Subject"}` });
      }
      for (const c of own ?? []) {
        options.push({ key: `${c.id}-class`, classId: c.id, subjectId: null, yearId: c.academic_year_id, label: `${c.name}${c.stream ? ` ${c.stream}` : ""} - Class register` });
      }
      return { staff, options };
    },
  });

  const options = portal.data?.options ?? [];
  const [key, setKey] = useState("");
  useEffect(() => { if (!key && options[0]) setKey(options[0].key); }, [options, key]);
  const current = options.find((o) => o.key === key) ?? null;

  if (portal.isLoading) return <div className="container-page py-16 text-muted-foreground">Loading your classes...</div>;
  if (!portal.data?.staff) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold text-primary">Your account is not linked yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Ask the school office to add you as a teacher using the email <strong>{user.email}</strong> on the Teacher assignments page. Then reload this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">Teaching and learning</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">Welcome, {portal.data.staff.full_name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Take registers and enter marks for the classes the school has assigned to you.</p>
        </div>
        <ManualButton manual={teacherManual} />
      </div>
      {options.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">No classes have been assigned to you yet. The school office assigns classes on the Teacher assignments page.</p>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Label htmlFor="cls">Class and subject</Label>
            <select id="cls" className="h-10 rounded-md border bg-background px-3 text-sm" value={key} onChange={(e) => setKey(e.target.value)}>
              {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          {current && <ClassWorkspace option={current} staffId={portal.data.staff.id} userId={user.id} onChange={() => void qc.invalidateQueries({ queryKey: ["teacher-class"] })} classCount={options.length} />}
        </>
      )}
    </div>
  );
}

function ClassWorkspace({ option, staffId, userId, classCount }: { option: ClassOption; staffId: string; userId: string; onChange: () => void; classCount: number }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(today());
  const session = option.subjectId ? `subject:${option.subjectId}` : "class";
  const learners = useQuery({
    queryKey: ["teacher-class", option.classId],
    queryFn: async () => (await supabase.from("students").select("id, first_name, last_name, student_no").eq("current_class_id", option.classId).order("last_name")).data ?? [],
  });
  const register = useQuery({
    queryKey: ["teacher-class", "register", option.classId, session, date],
    queryFn: async () => (await supabase.from("attendance_records").select("student_id, status").eq("class_id", option.classId).eq("attendance_date", date).eq("session_label", session)).data ?? [],
  });
  const [marks, setMarks] = useState<Record<string, Status>>({});
  useEffect(() => {
    const m: Record<string, Status> = {};
    for (const r of register.data ?? []) m[r.student_id] = r.status as Status;
    setMarks(m);
  }, [register.data]);

  const saveRegister = useMutation({
    mutationFn: async () => {
      const rows = (learners.data ?? []).map((s) => ({
        student_id: s.id, class_id: option.classId, subject_id: option.subjectId, academic_year_id: option.yearId,
        attendance_date: date, session_label: session, status: marks[s.id] ?? "present", recorded_by: userId,
      }));
      if (!rows.length) throw new Error("No learners");
      const { error } = await supabase.from("attendance_records").upsert(rows, { onConflict: "student_id,attendance_date,session_label" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Register saved"); void qc.invalidateQueries({ queryKey: ["teacher-class", "register"] }); },
    onError: () => toast.error("Could not save the register. Check that you are assigned to this class."),
  });

  const list = learners.data ?? [];
  const taken = (register.data ?? []).length > 0;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Assigned classes" value={String(classCount)} icon={Users} />
        <Metric label="Learners in this class" value={String(list.length)} icon={BookOpen} />
        <Metric label="Register for this date" value={taken ? "Saved" : "Not taken"} icon={CalendarCheck} />
        <Metric label="Marks" value={option.subjectId ? "Open" : "Subject only"} icon={ClipboardPenLine} />
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Attendance register</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everyone starts as present. Change anyone who is absent, late or excused, then save.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className="w-40" aria-label="Register date" />
            <Button size="sm" disabled={!list.length || saveRegister.isPending} onClick={() => saveRegister.mutate()}>Save register</Button>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-3 font-medium">Learner</th><th className="px-3 py-3 font-medium">Attendance</th></tr>
            </thead>
            <tbody className="divide-y">
              {learners.isLoading && <tr><td colSpan={2} className="px-3 py-6 text-muted-foreground">Loading learners...</td></tr>}
              {!learners.isLoading && !list.length && <tr><td colSpan={2} className="px-3 py-6 text-muted-foreground">No learners are placed in this class yet.</td></tr>}
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-3"><p className="font-medium text-primary">{s.first_name} {s.last_name}</p><p className="text-xs text-muted-foreground">{s.student_no}</p></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["present", "absent", "late", "excused"] as Status[]).map((st) => (
                        <Button key={st} type="button" size="sm" variant={(marks[s.id] ?? "present") === st ? "default" : "outline"} className="capitalize" onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}>{st}</Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {option.subjectId && <MarksSection option={option} staffId={staffId} userId={userId} learners={list} />}
    </>
  );
}

type Learner = { id: string; first_name: string; last_name: string; student_no: string };

function MarksSection({ option, staffId, userId, learners }: { option: ClassOption; staffId: string; userId: string; learners: Learner[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [assessmentId, setAssessmentId] = useState("");
  const assessments = useQuery({
    queryKey: ["teacher-class", "assessments", option.classId, option.subjectId],
    queryFn: async () => (await supabase.from("assessments").select("id, name, max_mark, assessment_date, state").eq("class_id", option.classId).eq("subject_id", option.subjectId!).order("created_at", { ascending: false })).data ?? [],
  });
  useEffect(() => { const first = assessments.data?.[0]; if (!assessmentId && first) setAssessmentId(first.id); }, [assessments.data, assessmentId]);
  const current = assessments.data?.find((a) => a.id === assessmentId);
  const results = useQuery({
    queryKey: ["teacher-class", "results", assessmentId],
    enabled: !!assessmentId,
    queryFn: async () => (await supabase.from("assessment_results").select("student_id, mark").eq("assessment_id", assessmentId)).data ?? [],
  });
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const v: Record<string, string> = {};
    for (const r of results.data ?? []) v[r.student_id] = r.mark == null ? "" : String(r.mark);
    setValues(v);
  }, [results.data]);

  const create = useMutation({
    mutationFn: async (v: { name: string; type: string; max: number; date: string }) => {
      const { data, error } = await supabase.from("assessments").insert({
        name: v.name, assessment_type: v.type as "test", max_mark: v.max, assessment_date: v.date || null,
        class_id: option.classId, subject_id: option.subjectId!, staff_id: staffId, academic_year_id: option.yearId,
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => { toast.success("Assessment created"); setOpen(false); setAssessmentId(id); void qc.invalidateQueries({ queryKey: ["teacher-class", "assessments"] }); },
    onError: () => toast.error("Could not create the assessment."),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!current) return;
      const rows = [];
      for (const s of learners) {
        const raw = values[s.id]?.trim();
        if (!raw) continue;
        const mark = Number(raw);
        if (Number.isNaN(mark) || mark < 0 || mark > Number(current.max_mark)) throw new Error(`Mark for ${s.first_name} must be between 0 and ${current.max_mark}`);
        rows.push({ assessment_id: current.id, student_id: s.id, mark, recorded_by: userId });
      }
      if (!rows.length) throw new Error("Enter at least one mark");
      const { error } = await supabase.from("assessment_results").upsert(rows, { onConflict: "assessment_id,student_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Marks saved"); void qc.invalidateQueries({ queryKey: ["teacher-class", "results"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save marks"),
  });

  const publish = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assessments").update({ state: "published" }).eq("id", assessmentId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Marks released to parents"); void qc.invalidateQueries({ queryKey: ["teacher-class", "assessments"] }); },
    onError: () => toast.error("Could not release the marks."),
  });

  const list = assessments.data ?? [];
  const avg = useMemo(() => {
    const nums = Object.values(values).filter((v) => v.trim() !== "").map(Number).filter((n) => !Number.isNaN(n));
    return nums.length && current ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length / Number(current.max_mark)) * 100) : null;
  }, [values, current]);

  return (
    <section className="mt-8 rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Marks</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create a test or assignment, enter marks, save, then release them so parents can see them.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {list.length > 0 && (
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">
              {list.map((a) => <option key={a.id} value={a.id}>{a.name} (out of {a.max_mark})</option>)}
            </select>
          )}
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}><FilePlus2 className="size-4" /> New assessment</Button>
        </div>
      </div>
      {!current ? (
        <p className="mt-5 text-sm text-muted-foreground">No assessments yet. Click New assessment to start.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={current.state === "published" ? "secondary" : "outline"}>{current.state === "published" ? "Released to parents" : "Not released yet"}</Badge>
            {avg !== null && <span className="text-muted-foreground">Class average {avg}%</span>}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-3 py-3 font-medium">Learner</th><th className="px-3 py-3 font-medium">Mark (out of {current.max_mark})</th></tr>
              </thead>
              <tbody className="divide-y">
                {learners.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-3 font-medium text-primary">{s.first_name} {s.last_name}</td>
                    <td className="px-3 py-3"><Input type="number" min={0} max={Number(current.max_mark)} step="0.5" className="w-28" value={values[s.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [s.id]: e.target.value }))} aria-label={`Mark for ${s.first_name}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>Save marks</Button>
            {current.state !== "published" && <Button size="sm" variant="outline" disabled={publish.isPending} onClick={() => publish.mutate()}>Release to parents</Button>}
          </div>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New assessment</DialogTitle></DialogHeader>
          <form id="new-assessment" className="grid gap-3" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const name = String(f.get("name") ?? "").trim().slice(0, 120);
            const max = Number(f.get("max"));
            if (!name || !(max > 0)) { toast.error("Enter a name and a total mark above 0"); return; }
            create.mutate({ name, type: String(f.get("type")), max, date: String(f.get("date") ?? "") });
          }}>
            <div className="grid gap-1"><Label htmlFor="a-name">Name</Label><Input id="a-name" name="name" placeholder="Term 1 test" required /></div>
            <div className="grid gap-1"><Label htmlFor="a-type">Type</Label>
              <select id="a-type" name="type" className="h-10 rounded-md border bg-background px-3 text-sm">
                {["test", "quiz", "assignment", "project", "practical", "continuous", "other"].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="grid gap-1"><Label htmlFor="a-max">Total mark</Label><Input id="a-max" name="max" type="number" min={1} defaultValue={100} /></div>
            <div className="grid gap-1"><Label htmlFor="a-date">Date</Label><Input id="a-date" name="date" type="date" defaultValue={today()} /></div>
          </form>
          <DialogFooter><Button type="submit" form="new-assessment" disabled={create.isPending}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <Icon className="size-4 text-secondary" aria-hidden="true" />
      <p className="mt-3 text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
