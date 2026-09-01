import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/lib/site-config";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
      <span className="flex size-11 items-center justify-center rounded-full border-2 border-gold bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-extrabold text-primary">{siteConfig.name}</span>
        <span className="block text-[11px] tracking-wide text-muted-foreground">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Brand />

        <nav aria-label="Main navigation" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="rounded-full px-3.5 py-2 text-sm font-bold text-primary/75 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden xl:block">
          <Button asChild className="rounded-full px-6 font-bold">
            <Link to="/apply">Register Now</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Open menu">
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="text-left text-primary">{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile navigation" className="px-3 py-4">
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-navy-soft" }}
                      className="block rounded-md px-3 py-2.5 text-base font-semibold text-primary hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-5 w-full rounded-full font-bold" onClick={() => setOpen(false)}>
                <Link to="/apply">Register Now</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
