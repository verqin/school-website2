import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
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
                  <Link to="/admin/admissions/settings" activeProps={{ className: "bg-accent" }}>
                    Admissions setup
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">Website</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}>
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
