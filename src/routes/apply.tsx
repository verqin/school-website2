import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/site/Header";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/apply")({
  component: ApplyLayout,
});

function ApplyLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/apply" className="flex items-center gap-3 font-semibold">
            <BrandMark className="size-10" />
            <span className="text-purple">
              {siteConfig.name} <span className="text-gold">Admissions</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admissions">Admissions info</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Website</Link>
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
