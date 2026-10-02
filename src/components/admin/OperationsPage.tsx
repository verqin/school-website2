import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Download, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/csv";

type OperationsPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  route?: string;
  metrics: { label: string; value: string; detail: string }[];
  columns: string[];
  rows?: string[][];
  actions?: string[];
  related?: { label: string; to: string }[];
  note?: string;
};

const PAGE_SIZE = 10;

/**
 * Generic staff register. Records are stored in the operations_records table
 * (one "module" per page) and protected by staff-only RLS.
 */
export function OperationsPage({ title, eyebrow, description, metrics, columns, related = [], note }: OperationsPageProps) {
  const module = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);

  const recordsQuery = useQuery({
    queryKey: ["operations", module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operations_records")
        .select("id, data, status, created_at")
        .eq("module", module)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(
    () =>
      (recordsQuery.data ?? []).map((r) => {
        const d = (r.data ?? {}) as Record<string, string>;
        const cells = columns.map((c, i) => (i === columns.length - 1 ? r.status : (d[c] ?? "")));
        return { id: r.id, cells };
      }),
    [recordsQuery.data, columns],
  );
  const filtered = rows.filter((r) => r.cells.join(" ").toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const add = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const status = values[columns[columns.length - 1]!] || "Active";
      const { error } = await supabase.from("operations_records").insert({ module, data: values, status });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Record saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["operations", module] });
    },
    onError: () => toast.error("Could not save. You may not have permission for this."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase.from("operations_records").delete({ count: "exact" }).eq("id", id);
      if (error) throw error;
      if (!count) throw new Error("denied");
    },
    onSuccess: () => {
      toast.success("Record removed");
      void qc.invalidateQueries({ queryKey: ["operations", module] });
    },
    onError: () => toast.error("Only administrators and the principal can remove records."),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const c of columns) values[c] = String(form.get(c) ?? "").trim().slice(0, 300);
    if (!values[columns[0]!]) return toast.error(`${columns[0]} is required`);
    add.mutate(values);
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Add record</Button>
          <Button
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() => downloadCsv(`${module}-${new Date().toISOString().slice(0, 10)}.csv`, columns, filtered.map((r) => r.cells))}
          >
            <Download data-icon="inline-start" />Export
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Records saved</p>
          <p className="mt-2 text-3xl font-semibold text-primary">{rows.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Live from the school database</p>
        </div>
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail} (target)</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Records</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search, export and review authorised school records.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Search records" aria-label="Search records" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{columns.map((c) => <th key={c} className="px-3 py-3 font-medium">{c}</th>)}<th /></tr>
            </thead>
            <tbody className="divide-y">
              {recordsQuery.isLoading && <tr><td colSpan={columns.length + 1} className="px-3 py-8 text-center text-muted-foreground">Loading records...</td></tr>}
              {recordsQuery.error && <tr><td colSpan={columns.length + 1} className="px-3 py-8 text-center text-destructive">Could not load records. Check your permissions.</td></tr>}
              {!recordsQuery.isLoading && !recordsQuery.error && visible.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-3 py-8 text-center text-muted-foreground">{search ? "No records match your search." : "No records yet. Use Add record to create the first one."}</td></tr>
              )}
              {visible.map((row) => (
                <tr key={row.id} className="transition hover:bg-muted/40">
                  {row.cells.map((cell, i) => (
                    <td key={i} className="px-3 py-4">{i === row.cells.length - 1 ? <Badge variant="secondary">{cell}</Badge> : cell}</td>
                  ))}
                  <td className="px-3 py-4 text-right">
                    <Button size="icon" variant="ghost" aria-label="Remove record" onClick={() => { if (confirm("Remove this record?")) remove.mutate(row.id); }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
          <span>Showing {visible.length} of {filtered.length} records - page {current + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {note && <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mr-2 inline size-4 text-gold" aria-hidden="true" />{note}</div>}
      {related.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3" aria-label="Related pages">
          {related.map((item) => <Button asChild key={item.to} variant="outline"><Link to={item.to}>{item.label}<ArrowUpRight data-icon="inline-end" /></Link></Button>)}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add record - {title}</DialogTitle></DialogHeader>
          <form id={`form-${module}`} onSubmit={submit} className="grid gap-3">
            {columns.map((c, i) => (
              <div key={c} className="grid gap-1.5">
                <Label htmlFor={`f-${c}`}>{c}{i === 0 ? " *" : ""}</Label>
                <Input id={`f-${c}`} name={c} placeholder={i === columns.length - 1 ? "Active" : ""} maxLength={300} />
              </div>
            ))}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form={`form-${module}`} disabled={add.isPending}>{add.isPending ? "Saving..." : "Save record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const sampleRows = { students: [] as string[][], admissions: [] as string[][], payments: [] as string[][] };

export function pageMeta(title: string) {
  return { meta: [{ title: `${title} - Cresta Reign Academy` }, { name: "robots", content: "noindex" }] };
}
