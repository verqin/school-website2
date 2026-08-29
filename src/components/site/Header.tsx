import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/lib/site-config";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-semibold">{siteConfig.name}</span>
        <span className="block text-xs text-muted-foreground">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Brand />

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-navy-soft text-primary" }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button asChild>
            <Link to="/apply">Apply now</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="flex items-center gap-2 text-left">
                <X className="size-0" aria-hidden="true" />
                {siteConfig.name}
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile navigation" className="px-3 py-4">
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-navy-soft text-primary" }}
                      className="block rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-5 w-full" onClick={() => setOpen(false)}>
                <Link to="/apply">Apply now</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
