import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="brand-gradient text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold">{siteConfig.name}</h2>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">{siteConfig.description}</p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-primary-foreground/70">
            Explore
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-primary-foreground/85 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-primary-foreground/70">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{siteConfig.contact.addressLines.join(", ")}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{siteConfig.contact.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-primary-foreground/70">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <Link to="/admin" className="underline-offset-4 hover:underline">
            Staff area
          </Link>
        </div>
      </div>
    </footer>
  );
}
