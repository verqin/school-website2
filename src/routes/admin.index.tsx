import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { adminStatsQuery } from "@/lib/admissions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff dashboard — Sample1 School" },
      { name: "description", content: "Secure staff dashboard for Sample1 School content and admissions." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff dashboard — Sample1 School" },
      { property: "og:description", content: "Secure staff dashboard for content and admissions." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const stats = useQuery(adminStatsQuery());
  const submitted = stats.data?.byStatus.submitted ?? 0;
  const review = stats.data?.byStatus.under_review ?? 0;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold">Staff dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Tile label="New submissions" value={submitted} />
        <Tile label="Under review" value={review} />
        <Tile label="Documents awaiting checks" value={stats.data?.pendingDocuments ?? 0} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/admin/admissions">Open admissions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/admissions/settings">Admissions setup</Link>
        </Button>
      </div>
      <p className="mt-8 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Content editing screens for news, events, gallery, staff, programmes and pages arrive in a later release — the
        database, storage and permissions for them are already in place.
      </p>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
