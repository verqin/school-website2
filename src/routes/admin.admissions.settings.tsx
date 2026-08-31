import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  admissionsSettingsQuery,
  gradeLevelsQuery,
  periodsQuery,
  requirementsQuery,
} from "@/lib/admissions";

export const Route = createFileRoute("/admin/admissions/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admissions setup - Sample1 School Staff" },
      { name: "description", content: "Configure admissions intakes, grade levels, requirements and settings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admissions setup - Sample1 School Staff" },
      { property: "og:description", content: "Configure intakes, grades, requirements and settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const periods = useQuery(periodsQuery());
  const grades = useQuery(gradeLevelsQuery());
  const requirements = useQuery(requirementsQuery());
  const settings = useQuery(admissionsSettingsQuery());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function saveSetting(key: string) {
    setError("");
    setSaved("");
    const value = (draft[key] ?? "").slice(0, 2000);
    const { error: updateError } = await supabase
      .from("admissions_settings")
      .update({ value })
      .eq("key", key);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(key);
    await queryClient.invalidateQueries({ queryKey: ["admissions", "settings"] });
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold">Admissions setup</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Intakes, grade levels and requirements drive the applicant wizard and the submission checks enforced in the
        database.
      </p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="mt-8 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Admissions intakes</h2>
        {periods.isLoading ? (
          <Skeleton className="mt-4 h-20 w-full" />
        ) : (
          <ul className="mt-4 grid gap-3">
            {(periods.data ?? []).map((period) => (
              <li key={period.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{period.name}</p>
                  <Badge variant="secondary">{period.academic_year}</Badge>
                  {period.is_active ? <Badge>Active</Badge> : null}
                </div>
                <p className="mt-1 text-muted-foreground">
                  Opens {new Date(period.opens_at).toLocaleDateString()}
                  {period.closes_at ? ` · closes ${new Date(period.closes_at).toLocaleDateString()}` : ""} · fee{" "}
                  {(period.application_fee_cents / 100).toFixed(2)} {period.currency}
                </p>
              </li>
            ))}
            {(periods.data ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">No active intakes.</li>
            ) : null}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Grade levels</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(grades.data ?? []).map((grade) => (
            <li key={grade.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{grade.name}</p>
              <p className="text-muted-foreground">
                {grade.code}
                {grade.capacity ? ` · capacity ${grade.capacity}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Document requirements</h2>
        <ul className="mt-4 grid gap-2">
          {(requirements.data ?? []).map((requirement) => (
            <li key={requirement.id} className="rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{requirement.label}</p>
                {requirement.is_mandatory ? <Badge>Mandatory</Badge> : <Badge variant="secondary">Optional</Badge>}
                {requirement.requires_document ? <Badge variant="secondary">Upload</Badge> : null}
              </div>
              {requirement.description ? (
                <p className="mt-1 text-muted-foreground">{requirement.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="mt-4 grid gap-4">
          {(settings.data ?? []).map((setting) => (
            <div key={setting.key} className="grid gap-2">
              <Label htmlFor={`setting-${setting.key}`}>{setting.description ?? setting.key}</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  id={`setting-${setting.key}`}
                  className="max-w-md"
                  maxLength={2000}
                  value={draft[setting.key] ?? setting.value ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [setting.key]: event.target.value }))
                  }
                />
                <Button size="sm" variant="outline" onClick={() => void saveSetting(setting.key)}>
                  Save
                </Button>
                {saved === setting.key ? (
                  <span className="self-center text-xs text-muted-foreground">Saved</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Payments, transactional email and third-party document verification are intentionally not connected yet.
      </p>
    </div>
  );
}
