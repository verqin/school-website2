import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, CreditCard, FileText, Landmark, Plus, Receipt, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv, money } from "@/lib/csv";

export const Route = createFileRoute("/admin/finance")({
  ssr: false,
  head: () => ({ meta: [{ title: "Finance - Cresta Reign Academy" }, { name: "robots", content: "noindex" }] }),
  component: FinanceWorkspace,
});

const STRUCTURE_NAME = "Standard day-school fees";
const sel = "h-9 rounded-md border bg-background px-3 text-sm";

function FinanceWorkspace() {
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  const payments = useQuery({
    queryKey: ["fin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_cents, payment_date, provider, transaction_reference, verified, students(first_name, last_name, student_no)")
        .order("payment_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
  const invoices = useQuery({
    queryKey: ["fin-invoices"],
    queryFn: async () => (await supabase.from("invoices").select("total_cents, paid_cents, status")).data ?? [],
  });
  const fees = useQuery({
    queryKey: ["fin-fees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("fee_structure_items")
        .select("id, amount_cents, fee_categories(name), fee_structures!inner(name, is_active)")
        .eq("fee_structures.name", STRUCTURE_NAME);
      return data ?? [];
    },
  });
  const students = useQuery({
    queryKey: ["fin-students"],
    queryFn: async () => (await supabase.from("students").select("id, first_name, last_name, student_no").order("last_name")).data ?? [],
  });
  const methods = useQuery({
    queryKey: ["fin-methods"],
    queryFn: async () => (await supabase.from("payment_methods").select("id, name").eq("is_active", true)).data ?? [],
  });

  const list = payments.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const todays = list.filter((p) => p.payment_date === today);
  const inv = invoices.data ?? [];
  const billed = inv.reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const paid = inv.reduce((s, i) => s + (i.paid_cents ?? 0), 0);
  const pct = billed ? Math.round((paid / billed) * 100) : 0;
  const feeTotal = (fees.data ?? []).reduce((s, f) => s + f.amount_cents, 0);
  const studentName = (p: (typeof list)[number]) => {
    const s = p.students as { first_name: string; last_name: string; student_no: string } | null;
    return s ? `${s.first_name} ${s.last_name}` : "Unknown";
  };

  const recordPayment = useMutation({
    mutationFn: async (v: { student_id: string; amount: number; date: string; method: string; reference: string }) => {
      const m = (methods.data ?? []).find((x) => x.id === v.method);
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("payments").insert({
        student_id: v.student_id,
        amount_cents: Math.round(v.amount * 100),
        payment_date: v.date,
        payment_method_id: m?.id ?? null,
        provider: m?.name ?? "Cash",
        transaction_reference: v.reference || null,
        received_by: u.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setPayOpen(false);
      void qc.invalidateQueries({ queryKey: ["fin-payments"] });
      void qc.invalidateQueries({ queryKey: ["fin-invoices"] });
    },
    onError: () => toast.error("Could not record the payment. You may not have permission."),
  });

  const addFee = useMutation({
    mutationFn: async (v: { name: string; amount: number }) => {
      let { data: structure } = await supabase.from("fee_structures").select("id").eq("name", STRUCTURE_NAME).maybeSingle();
      if (!structure) {
        const { data: year } = await supabase.from("academic_years").select("id").order("start_date", { ascending: false }).limit(1).maybeSingle();
        if (!year) throw new Error("Create an academic year first");
        const r = await supabase.from("fee_structures").insert({ name: STRUCTURE_NAME, currency: "USD", is_active: true, academic_year_id: year.id }).select("id").single();
        if (r.error) throw r.error;
        structure = r.data;
      }
      let { data: cat } = await supabase.from("fee_categories").select("id").eq("name", v.name).maybeSingle();
      if (!cat) {
        const r = await supabase.from("fee_categories").insert({ name: v.name, code: v.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 30) }).select("id").single();
        if (r.error) throw r.error;
        cat = r.data;
      }
      const { error } = await supabase.from("fee_structure_items").insert({ fee_structure_id: structure.id, fee_category_id: cat.id, amount_cents: Math.round(v.amount * 100) });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fee item added");
      setFeeOpen(false);
      void qc.invalidateQueries({ queryKey: ["fin-fees"] });
    },
    onError: () => toast.error("Could not add the fee item. You may not have permission."),
  });

  const removeFee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fee_structure_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fin-fees"] }),
    onError: () => toast.error("Could not remove the fee item."),
  });

  function printReceipt(p: (typeof list)[number]) {
    const w = window.open("", "_blank", "width=480,height=600");
    if (!w) { toast.error("Allow pop-ups to print receipts"); return; }
    const s = p.students as { student_no: string } | null;
    w.document.write(`<html><head><title>Receipt</title></head><body style="font-family:sans-serif;padding:24px"><h2>Cresta Reign Academy</h2><p>Official payment receipt</p><hr/><p><b>Student:</b> ${studentName(p)} (${s?.student_no ?? ""})</p><p><b>Amount:</b> ${money(p.amount_cents)}</p><p><b>Date:</b> ${p.payment_date}</p><p><b>Method:</b> ${p.provider ?? ""}</p><p><b>Reference:</b> ${p.transaction_reference ?? "-"}</p><p><b>Receipt ID:</b> ${p.id.slice(0, 8).toUpperCase()}</p></body></html>`);
    w.document.close();
    w.print();
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">Finance and bursar workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">Fees, collections and receipts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Manage the day-school fee structure, record payments and print receipts.</p>
        </div>
        <Button onClick={() => setPayOpen(true)}><Receipt className="size-4" /> Record payment</Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Today's collections" value={money(todays.reduce((s, p) => s + p.amount_cents, 0))} detail={`${todays.length} transactions`} icon={WalletCards} />
        <Metric label="Outstanding balances" value={money(billed - paid)} detail={`Across ${inv.length} invoices`} icon={Landmark} />
        <Metric label="Total collected" value={money(list.reduce((s, p) => s + p.amount_cents, 0))} detail="Recorded payments" icon={CreditCard} />
        <Metric label="Payments recorded" value={String(list.length)} detail="Most recent 200" icon={FileText} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold">{STRUCTURE_NAME}</h2><p className="mt-1 text-sm text-muted-foreground">Per term. No boarding charges.</p></div>
            <Badge variant="secondary">Active</Badge>
          </div>
          <div className="mt-5 divide-y">
            {(fees.data ?? []).length === 0 && <p className="py-3 text-sm text-muted-foreground">No fee items yet. Add the first one below.</p>}
            {(fees.data ?? []).map((f) => (
              <div key={f.id} className="flex items-center justify-between py-3 text-sm">
                <span>{(f.fee_categories as { name: string } | null)?.name}</span>
                <span className="flex items-center gap-3 font-medium text-primary">{money(f.amount_cents)}
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Remove this fee item?")) removeFee.mutate(f.id); }}>Remove</Button>
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 font-semibold"><span>Standard term total</span><span className="text-lg text-primary">{money(feeTotal)}</span></div>
          </div>
          <Button className="mt-5" variant="outline" size="sm" onClick={() => setFeeOpen(true)}><Plus className="size-4" /> Add fee item</Button>
        </section>
        <section className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-semibold">Collection health</h2>
          <div className="mt-5 flex items-end gap-3"><span className="text-5xl font-semibold text-primary">{pct}%</span><span className="pb-2 text-sm text-muted-foreground">of invoiced fees collected</span></div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} /></div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Paid invoices</dt><dd className="font-medium">{inv.filter((i) => i.status === "paid").length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Partially paid</dt><dd className="font-medium">{inv.filter((i) => i.status === "partially_paid").length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Overdue</dt><dd className="font-medium">{inv.filter((i) => i.status === "overdue").length}</dd></div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="font-semibold">Recent transactions</h2><p className="mt-1 text-sm text-muted-foreground">Every payment can produce a printable receipt.</p></div>
          <Button variant="outline" size="sm" disabled={!list.length} onClick={() => downloadCsv("payments.csv", ["Date", "Student", "Method", "Reference", "Amount"], list.map((p) => [p.payment_date, studentName(p), p.provider, p.transaction_reference, money(p.amount_cents)]))}>
            <ArrowDownToLine className="size-4" /> Export report
          </Button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Student</th><th className="px-3 py-3 font-medium">Method</th><th className="px-3 py-3 font-medium">Reference</th><th className="px-3 py-3 font-medium">Amount</th><th /></tr>
            </thead>
            <tbody className="divide-y">
              {payments.isLoading && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Loading payments...</td></tr>}
              {payments.error && <tr><td colSpan={6} className="px-3 py-8 text-center text-destructive">Could not load payments. Check your permissions.</td></tr>}
              {!payments.isLoading && !payments.error && list.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No payments recorded yet.</td></tr>}
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-4 text-muted-foreground">{p.payment_date}</td>
                  <td className="px-3 py-4">{studentName(p)}</td>
                  <td className="px-3 py-4"><Badge variant="outline">{p.provider ?? "-"}</Badge></td>
                  <td className="px-3 py-4">{p.transaction_reference ?? "-"}</td>
                  <td className="px-3 py-4 font-medium">{money(p.amount_cents)}</td>
                  <td className="px-3 py-4 text-right"><Button variant="ghost" size="sm" onClick={() => printReceipt(p)}>Receipt</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
          <form id="pay-form" className="grid gap-3" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const amount = Number(f.get("amount"));
            const student_id = String(f.get("student_id") ?? "");
            if (!student_id) { toast.error("Choose a student"); return; }
            if (!(amount > 0) || amount > 100000) { toast.error("Enter a valid amount"); return; }
            recordPayment.mutate({ student_id, amount, date: String(f.get("date") || today), method: String(f.get("method") ?? ""), reference: String(f.get("reference") ?? "").trim().slice(0, 100) });
          }}>
            <div className="grid gap-1.5"><Label htmlFor="student_id">Student *</Label>
              <select id="student_id" name="student_id" className={sel}>
                <option value="">{(students.data ?? []).length ? "Choose a student" : "No students on the register yet"}</option>
                {(students.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_no})</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label htmlFor="amount">Amount (USD) *</Label><Input id="amount" name="amount" type="number" step="0.01" min="0.01" /></div>
            <div className="grid gap-1.5"><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" defaultValue={today} /></div>
            <div className="grid gap-1.5"><Label htmlFor="method">Method</Label>
              <select id="method" name="method" className={sel}>
                <option value="">Cash</option>
                {(methods.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label htmlFor="reference">Reference</Label><Input id="reference" name="reference" maxLength={100} /></div>
          </form>
          <DialogFooter><Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button><Button type="submit" form="pay-form" disabled={recordPayment.isPending}>{recordPayment.isPending ? "Saving..." : "Record payment"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add fee item</DialogTitle></DialogHeader>
          <form id="fee-form" className="grid gap-3" onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const name = String(f.get("name") ?? "").trim().slice(0, 80);
            const amount = Number(f.get("amount"));
            if (!name || !(amount > 0)) { toast.error("Enter a name and amount"); return; }
            addFee.mutate({ name, amount });
          }}>
            <div className="grid gap-1.5"><Label htmlFor="fname">Fee name *</Label><Input id="fname" name="name" placeholder="Tuition" maxLength={80} /></div>
            <div className="grid gap-1.5"><Label htmlFor="famount">Amount per term (USD) *</Label><Input id="famount" name="amount" type="number" step="0.01" min="0.01" /></div>
          </form>
          <DialogFooter><Button variant="outline" onClick={() => setFeeOpen(false)}>Cancel</Button><Button type="submit" form="fee-form" disabled={addFee.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof WalletCards }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-secondary" aria-hidden="true" /></div>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
