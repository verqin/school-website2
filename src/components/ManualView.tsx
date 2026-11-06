import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Manual } from "@/lib/manuals";

export function ManualView({ manual }: { manual: Manual }) {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const pages = manual.pages.filter((p) => !s || JSON.stringify(p).toLowerCase().includes(s));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">{manual.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">For: {manual.audience}</p>
        <p className="mt-3 max-w-3xl">{manual.intro}</p>
      </div>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-secondary">How to get in</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{manual.access.map((a) => <li key={a}>{a}</li>)}</ol>
      </section>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the manual, for example payment or register" aria-label="Search the manual" />
      {pages.length === 0 && <p className="text-sm text-muted-foreground">Nothing matches your search.</p>}
      {pages.map((p) => (
        <details key={p.path} className="rounded-xl border bg-card p-5" open={!!s || manual.pages.length === 1}>
          <summary className="cursor-pointer font-semibold text-primary">
            {p.name} <span className="ml-2 text-xs font-normal text-muted-foreground">{p.path}</span>
          </summary>
          <p className="mt-3 text-sm"><strong>Purpose:</strong> {p.purpose}</p>
          {p.features.length > 0 && (<><h3 className="mt-4 text-sm font-semibold text-secondary">Features</h3><ul className="list-disc pl-5 text-sm">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></>)}
          {p.buttons.length > 0 && (
            <><h3 className="mt-4 text-sm font-semibold text-secondary">Buttons and actions</h3>
            <dl className="mt-1 grid gap-2 text-sm sm:grid-cols-[180px_1fr]">
              {p.buttons.map(([b, d]) => (<div key={b} className="contents"><dt className="font-medium text-gold">{b}</dt><dd>{d}</dd></div>))}
            </dl></>
          )}
          {p.processes.map((pr) => (
            <div key={pr.title} className="mt-4 rounded-lg bg-muted/40 p-4">
              <h3 className="text-sm font-semibold">How to: {pr.title}</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">{pr.steps.map((st) => <li key={st}>{st}</li>)}</ol>
            </div>
          ))}
          {p.tips?.map((t) => <p key={t} className="mt-3 text-xs text-muted-foreground">Tip: {t}</p>)}
        </details>
      ))}
    </div>
  );
}

export function ManualButton({ manual }: { manual: Manual }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline"><BookOpen className="size-4" /> User manual</Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle className="sr-only">{manual.title}</SheetTitle></SheetHeader>
        <ManualView manual={manual} />
      </SheetContent>
    </Sheet>
  );
}
