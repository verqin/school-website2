import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";

export function Footer() {
  const [taps, setTaps] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [codeOne, setCodeOne] = useState("");
  const [codeTwo, setCodeTwo] = useState("");

  function handleCrestTap() {
    const next = taps + 1;
    setTaps(next);
    if (next >= 7) setUnlocked(true);
  }

  function enterDashboard(event: React.FormEvent) {
    event.preventDefault();
    if (codeOne.trim().toLowerCase() === "dual" && codeTwo.trim().toLowerCase() === "system") {
      window.location.assign("/admin");
    }
  }

  return (
    <footer className="brand-gradient text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.15fr_0.85fr_1fr]">
        <div>
          <button type="button" onClick={handleCrestTap} className="group flex items-center gap-3 text-left" aria-label="Cresta Reign Academy crest">
            <img src="/cresta-reign-crest.png" alt="" className="size-14 rounded-2xl object-contain transition-transform group-hover:scale-105" />
            <span>
              <span className="block text-lg font-semibold tracking-tight">{siteConfig.name}</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-primary-foreground/65">Rise with purpose</span>
            </span>
          </button>
          <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/80">{siteConfig.description}</p>
        </div>
        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {mainNav.map((item) => <li key={item.to}><Link to={item.to} className="text-primary-foreground/85 underline-offset-4 hover:underline">{item.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">Bulawayo offices</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-primary-foreground/85">
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{siteConfig.contact.addressLines.join(" · ")}</span></li>
            <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{siteConfig.contact.phone}</span></li>
            <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{siteConfig.contact.email}</span></li>
          </ul>
        </div>
      </div>
      {unlocked ? (
        <form onSubmit={enterDashboard} className="container-page border-t border-white/15 py-5" aria-label="Staff dashboard unlock">
          <div className="flex flex-wrap items-end gap-3">
            <ShieldCheck className="mb-2 size-5 text-gold" aria-hidden="true" />
            <label className="grid gap-1 text-xs text-primary-foreground/70">Access code 1<input value={codeOne} onChange={(event) => setCodeOne(event.target.value)} className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none" /></label>
            <label className="grid gap-1 text-xs text-primary-foreground/70">Access code 2<input value={codeTwo} onChange={(event) => setCodeTwo(event.target.value)} className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none" /></label>
            <button className="skeu-gold h-9 rounded-lg px-4 text-sm font-semibold" type="submit">Open command center</button>
          </div>
        </form>
      ) : null}
      <div className="border-t border-white/15"><div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-primary-foreground/70"><p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p><span>Academic · Vocational · Professional</span></div></div>
    </footer>
  );
}
