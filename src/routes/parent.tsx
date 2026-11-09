import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { CalendarDays, CircleDollarSign, FileText, GraduationCap, MessageSquare, TrendingUp } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManualButton } from "@/components/ManualView";
import { parentManual } from "@/lib/manuals";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/parent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parent portal - Cresta Reign Academy" },
      { name: "description", content: "Attendance, marks, reports and fees for Cresta Reign Academy families." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthGate
      title="Parent portal sign in"
      description="Access your children's attendance, academic progress and fee statements."
      allowSignUp
    >
      {(user) => <ParentDashboard user={user} />}
    </AuthGate>
  ),
});

const money = (cents: number, cur = "USD") => `${cur} ${(cents / 100).toFixed(2)}`;

function ParentDashboard({ user }: { user: User }) {
  const kids = useQuery({
    queryKey: ["parent-portal", user.id],
    queryFn: async () => {
      await supabase.rpc("claim_portal_links");
      const { data: g } = await supabase.from("guardians").select("id, full_name").eq("user_id", user.id).maybeSingle();
      if (!g) return { guardian: null, children: [] };
      const { data: rel } = await supabase
        .from("parent_student_relationships")
        .select("students(id, first_name, last_name, student_no, status, grade_levels(name), classes:current_class_id(name, stream))")
        .eq("guardian_id", g.id);
      const children = (rel ?? []).map((r) => r.students).filter(Boolean) as unknown as Child[];
      return { guardian: g, children };
    },
  });
  const [childId, setChildId] = useState("");
  const children = kids.data?.children ?? [];
  useEffect(() => { if (!childId && children[0]) setChildId(children[0].id); }, [children, childId]);
  const child = children.find((c) => c.id === childId);

  if (kids.isLoading) return <div className="container-page py-16 text-muted-foreground">Loading your family...</div>;
  if (!kids.data?.guardian || children.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold text-primary">Your account is not linked yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Ask the school office to link your email <strong>{user.email}</strong> to your child on the Students page. Then reload this page.
          </p>
          <Button asChild variant="outline" className="mt-5"><Link to="/contact">Contact the school</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">Family partnership</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">Welcome, {kids.data.guardian.full_name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Attendance, marks, reports and fees for your children.</p>
        </div>
        <div className="flex gap-2">
          <ManualButton manual={parentManual} />
          <Button asChild variant="outline"><Link to="/contact"><MessageSquare className="size-4" /> Contact school</Link></Button>
        </div>
      </div>
      {children.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((c) => <Button key={c.id} size="sm" variant={c.id === childId ? "default" : "outline"} onClick={() => setChildId(c.id)}>{c.first_name}</Button>)}
        </div>
      )}
      {child && <ChildView child={child} />}
    </div>
  );
}

type Child = { id: string; first_name: string; last_name: string; student_no: string; status: string; grade_levels: { name: string } | null; classes: { name: string; stream: string | null } | null };

function ChildView({ child }: { child: Child }) {
  const data = useQuery({
    queryKey: ["parent-child", child.id],
    queryFn: async () => {
      const [att, res, reps, inv, pay] = await Promise.all([
        supabase.from("attendance_records").select("status, attendance_date").eq("student_id", child.id).order("attendance_date", { ascending: false }).limit(200),
        supabase.from("assessment_results").select("mark, assessments(name, max_mark, assessment_date, subjects(name))").eq("student_id", child.id).limit(200),
        supabase.from("report_cards").select("id, overall_percentage, overall_grade, class_teacher_comment, principal_comment, published_at, terms(name)").eq("student_id", child.id).order("published_at", { ascending: false }),
        supabase.from("invoices").select("id, invoice_no, total_cents, paid_cents, currency, status, due_date").eq("student_id", child.id).order("issue_date", { ascending: false }),
        supabase.from("payments").select("id, amount_cents, paid_at, status").eq("student_id", child.id).order("paid_at", { ascending: false }).limit(20),
      ]);
      return { att: att.data ?? [], res: res.data ?? [], reps: reps.data ?? [], inv: inv.data ?? [], pay: (pay.data ?? []) as { id: string; amount_cents: number; paid_at: string | null; status: string }[] };
    },
  });
  const d = data.data;
  const present = d ? d.att.filter((a) => a.status === "present" || a.status === "late").length : 0;
  const attPct = d && d.att.length ? `${Math.round((present / d.att.length) * 100)}%` : "No records";
  const results = (d?.res ?? []).map((r) => {
    const a = r.assessments as { name: string; max_mark: number; assessment_date: string | null; subjects: { name: string } | null } | null;
    return { name: a?.name ?? "", subject: a?.subjects?.name ?? "", pct: a && r.mark != null ? Math.round((Number(r.mark) / Number(a.max_mark)) * 100) : null, date: a?.assessment_date ?? "" };
  }).filter((r) => r.pct !== null);
  const avg = results.length ? `${Math.round(results.reduce((s, r) => s + (r.pct ?? 0), 0) / results.length)}%` : "No marks yet";
  const balance = (d?.inv ?? []).filter((i) => i.status !== "cancelled").reduce((s, i) => s + i.total_cents - i.paid_cents, 0);
  const cur = d?.inv[0]?.currency ?? "USD";
  const cls = child.classes ? `${child.classes.name}${child.classes.stream ? ` ${child.classes.stream}` : ""}` : child.grade_levels?.name ?? "Class not set";

  return (
    <>
      <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-forest-soft text-secondary"><GraduationCap className="size-7" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-semibold text-primary">{child.first_name} {child.last_name}</h2>
              <p className="text-sm text-muted-foreground">{cls} - {child.student_no}</p>
            </div>
          </div>
          <Badge className="capitalize">{child.status}</Badge>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Quick label="Attendance" value={attPct} icon={CalendarDays} />
          <Quick label="Average mark" value={avg} icon={TrendingUp} />
          <Quick label="Fee balance" value={money(balance, cur)} icon={CircleDollarSign} />
          <Quick label="Report cards" value={String(d?.reps.length ?? 0)} icon={FileText} />
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Released marks</h2>
          {results.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Marks appear here once teachers release them.</p> : (
            <div className="mt-5 grid gap-4">
              {results.slice(0, 12).map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm"><span>{r.subject} - {r.name}</span><span className="font-medium text-primary">{r.pct}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-semibold">Fee statement</h2>
          <div className="mt-4 flex items-end justify-between border-b border-gold/20 pb-4">
            <span className="text-sm text-muted-foreground">Outstanding balance</span>
            <span className="text-3xl font-semibold text-primary">{money(balance, cur)}</span>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            {(d?.inv ?? []).length === 0 && <p className="text-muted-foreground">No invoices yet.</p>}
            {(d?.inv ?? []).map((i) => (
              <div key={i.id} className="flex justify-between gap-3"><span>{i.invoice_no}{i.due_date ? ` - due ${i.due_date}` : ""}</span><span className="capitalize">{money(i.total_cents - i.paid_cents, i.currency)} - {i.status.replace("_", " ")}</span></div>
            ))}
          </div>
          {(d?.pay ?? []).length > 0 && (
            <div className="mt-4 border-t border-gold/20 pt-3 text-sm">
              <p className="font-medium">Recent payments</p>
              {d!.pay.map((p) => <div key={p.id} className="flex justify-between"><span>{p.paid_at?.slice(0, 10) ?? ""}</span><span>{money(p.amount_cents, cur)}</span></div>)}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Pay at the finance office or through the school's listed payment methods. Your payment appears here once recorded.</p>
        </section>
      </div>
      <section className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Report cards</h2>
        {(d?.reps ?? []).length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Report cards appear here once the school publishes them.</p> : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {d!.reps.map((r) => (
              <div key={r.id} className="rounded-xl border bg-background p-4 text-sm">
                <p className="font-medium text-primary">{(r.terms as { name: string } | null)?.name ?? "Report"} - {r.overall_percentage ?? "-"}% {r.overall_grade ?? ""}</p>
                {r.class_teacher_comment && <p className="mt-2 text-muted-foreground">Teacher: {r.class_teacher_comment}</p>}
                {r.principal_comment && <p className="mt-1 text-muted-foreground">Principal: {r.principal_comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Quick({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDays }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <Icon className="size-4 text-secondary" aria-hidden="true" />
      <p className="mt-3 text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
