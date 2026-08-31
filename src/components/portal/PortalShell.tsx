import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  exact?: boolean;
};

/**
 * Shared dashboard chrome for every authenticated portal (parent, student,
 * teacher, admin). Navigation is passed in per role so each portal only shows
 * what that role is allowed to use.
 */
export function PortalShell({
  portalName,
  userLabel,
  nav,
  actions,
  children,
}: {
  portalName: string;
  userLabel: string;
  nav: PortalNavItem[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: PortalNavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

  const navList = (onNavigate?: () => void) => (
    <nav aria-label={`${portalName} sections`} className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          aria-current={isActive(item) ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
            isActive(item) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
          )}
        >
          <span aria-hidden="true" className="flex size-5 items-center justify-center">
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="border-b px-4 py-4 text-base">{portalName}</SheetTitle>
              <div className="p-3">{navList()}</div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="truncate">{siteConfig.shortName}</span>
            <span className="hidden truncate text-sm font-normal text-muted-foreground sm:inline">{portalName}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">{userLabel}</span>
            <Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}>
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-card p-3 lg:block">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {portalName}
          </p>
          {navList()}
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground" aria-hidden="true">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
