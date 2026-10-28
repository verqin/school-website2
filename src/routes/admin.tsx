import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const sections: [string, string][] = [
  ["Content", "/admin"], ["Admissions", "/admin/admissions"], ["Students", "/admin/students"],
  ["Finance", "/admin/finance"], ["Payments", "/admin/finance/payments"], ["Messages", "/admin/messages"],
  ["Academics", "/admin/academics"], ["Attendance", "/admin/attendance"], ["Staff", "/admin/staff"],
  ["Inventory", "/admin/inventory"], ["Procurement", "/admin/procurement"], ["Visitors", "/admin/security/visitors"],
  ["Communication", "/admin/communication"], ["Reports", "/admin/reports"], ["Calendar", "/admin/calendar"],
  ["Discipline", "/admin/discipline"], ["Documents", "/admin/documents"], ["Certificates", "/admin/certificates"],
  ["Governance", "/admin/governance"], ["Settings", "/admin/settings"], ["Intelligence", "/admin/ai"],
  ["Architecture", "/admin/architecture"], ["Admissions setup", "/admin/admissions/settings"],
];

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <AuthGate
      title="Staff sign in"
      description="Administration is restricted to school staff accounts."
      requireStaff
    >
      {(user) => (
        <div className="flex min-h-screen flex-col bg-muted/30">
          <header className="border-b bg-card">
            <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
              <Link to="/admin" className="flex items-center gap-2 font-semibold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <span>{siteConfig.name} Staff</span>
              </Link>
              <form
                className="relative order-3 w-full md:order-none md:w-64"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = String(new FormData(e.currentTarget).get("q") ?? "").trim().toLowerCase();
                  if (!q) return;
                  const hit = sections.find(([label]) => label.toLowerCase().includes(q));
                  void navigate({ to: hit ? hit[1] : "/admin/students" });
                }}
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input name="q" list="admin-sections" className="h-9 bg-muted/40 pl-9" placeholder="Jump to a section (Enter)" aria-label="Global search" />
                <datalist id="admin-sections">{sections.map(([l]) => <option key={l} value={l} />)}</datalist>
              </form>
              <nav
                aria-label="Admin sections"
                className="flex flex-wrap items-center gap-1 text-sm"
              >
                <Button asChild variant="ghost" size="sm">
                  <Link
                    to="/admin"
                    activeOptions={{ exact: true }}
                    activeProps={{ className: "bg-accent" }}
                  >
                    Content
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/admissions" activeProps={{ className: "bg-accent" }}>
                    Admissions
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/students" activeProps={{ className: "bg-accent" }}>
                    Students
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/finance" activeProps={{ className: "bg-accent" }}>
                    Finance
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/messages" activeProps={{ className: "bg-accent" }}>
                    Messages
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/academics" activeProps={{ className: "bg-accent" }}>
                    Academics
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/attendance" activeProps={{ className: "bg-accent" }}>
                    Attendance
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/staff" activeProps={{ className: "bg-accent" }}>
                    People
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/inventory" activeProps={{ className: "bg-accent" }}>
                    Inventory
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/procurement" activeProps={{ className: "bg-accent" }}>
                    Procurement
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/security/visitors" activeProps={{ className: "bg-accent" }}>
                    Visitors
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/communication" activeProps={{ className: "bg-accent" }}>
                    Communication
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/reports" activeProps={{ className: "bg-accent" }}>
                    Reports
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/ai" activeProps={{ className: "bg-accent" }}>
                    Intelligence
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/architecture" activeProps={{ className: "bg-accent" }}>
                    Architecture
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/admissions/settings" activeProps={{ className: "bg-accent" }}>
                    Admissions setup
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">Website</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={async () => {
                  await qc.cancelQueries();
                  qc.clear();
                  await supabase.auth.signOut();
                  void navigate({ to: "/admin", replace: true });
                }}>
                  Sign out
                </Button>
              </nav>
            </div>
            <div className="container-page pb-3 text-xs text-muted-foreground">
              Signed in as {user.email}
            </div>
          </header>
          <main id="main" className="flex-1 pb-20">
            <Outlet />
          </main>
        </div>
      )}
    </AuthGate>
  );
}
