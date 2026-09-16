import { createFileRoute } from "@tanstack/react-router";
import { Download, LockKeyhole, Server, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { platformArchitecture, downloadArchitectureBrief } from "@/lib/platform-architecture";

export const Route = createFileRoute("/admin/architecture")({
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Phase 3 · Architecture</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">Trust & platform architecture</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">A living control room for tenant isolation, role boundaries, data structures, and operational safeguards across Cresta Reign Academy.</p>
        </div>
        <Button variant="outline" onClick={downloadArchitectureBrief}><Download data-icon="inline-start" />Download brief</Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm"><Server className="size-5 text-primary" aria-hidden="true" /><p className="mt-4 text-sm text-muted-foreground">Active tenant</p><p className="mt-1 font-semibold">{platformArchitecture.tenant.school}</p><p className="mt-1 text-xs text-muted-foreground">{platformArchitecture.tenant.schoolType}</p></div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm"><LockKeyhole className="size-5 text-gold" aria-hidden="true" /><p className="mt-4 text-sm text-muted-foreground">Authorisation model</p><p className="mt-1 font-semibold">RBAC + RLS</p><p className="mt-1 text-xs text-muted-foreground">School-scoped records and granular permissions</p></div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm"><ShieldCheck className="size-5 text-forest" aria-hidden="true" /><p className="mt-4 text-sm text-muted-foreground">Security posture</p><p className="mt-1 font-semibold">Day-school safe</p><p className="mt-1 text-xs text-muted-foreground">No boarding, dormitory, or bed-allocation data</p></div>
      </div>

      <section className="mt-8 rounded-2xl border bg-card p-5 shadow-sm" aria-labelledby="modules-heading">
        <div className="flex items-center justify-between gap-4"><div><h2 id="modules-heading" className="font-semibold">Domain map</h2><p className="mt-1 text-sm text-muted-foreground">Relational boundaries planned for the shared PostgreSQL tenant model.</p></div><Badge variant="secondary">{platformArchitecture.modules.length} domains</Badge></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{platformArchitecture.modules.map((module) => <article key={module.name} className="rounded-xl border bg-muted/20 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium">{module.name}</h3><Badge variant="outline">{module.status}</Badge></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{module.tables.join(" · ")}</p></article>)}</div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm" aria-labelledby="security-heading"><h2 id="security-heading" className="font-semibold">Security controls</h2><ul className="mt-4 flex flex-col gap-3">{platformArchitecture.securityControls.map((control) => <li key={control} className="flex gap-3 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-1 size-4 shrink-0 text-forest" aria-hidden="true" />{control}</li>)}</ul></section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm" aria-labelledby="constraints-heading"><h2 id="constraints-heading" className="font-semibold">Non-negotiable rules</h2><ul className="mt-4 flex flex-col gap-3">{platformArchitecture.constraints.map((constraint) => <li key={constraint} className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground">{constraint}</li>)}</ul></section>
      </div>
      <p className="mt-6 text-xs leading-5 text-muted-foreground">This workspace documents the production architecture without exposing credentials. Live schema changes, migrations, storage policies, and edge functions remain controlled by the connected Supabase environment and must be applied only through an authorised deployment workflow.</p>
    </div>
  );
}
