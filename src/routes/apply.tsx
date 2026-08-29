import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/apply")({
  ssr: false,
  component: ApplyLayout,
});

function ApplyLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/apply" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" aria-hidden="true" />
            </span>
            <span>{siteConfig.name} Admissions</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admissions">Admissions info</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Website</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1 pb-20">
        <Outlet />
      </main>
    </div>
  );
}
