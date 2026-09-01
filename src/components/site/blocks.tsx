import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed image hero: photograph washed out behind a large centred
 * headline, matching the layout of the reference school site.
 */
export function ImageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  actions,
  size = "page",
  showCrest = false,
  priority = false,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  size?: "page" | "hero" | undefined;
  showCrest?: boolean | undefined;
  priority?: boolean | undefined;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-background/82" aria-hidden="true" />
      <div
        className={cn(
          "relative container-page flex flex-col items-center justify-center text-center",
          size === "hero" ? "min-h-[78vh] py-24" : "py-20 sm:py-28",
        )}
      >
        {showCrest ? (
          <span className="mb-8 flex size-24 items-center justify-center rounded-full border-4 border-gold bg-primary text-primary-foreground shadow-xl">
            <GraduationCap className="size-11" aria-hidden="true" />
          </span>
        ) : null}
        {eyebrow ? (
          <p className="mb-4 text-xs font-bold tracking-[0.24em] uppercase text-gold">{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            "font-extrabold tracking-tight text-primary",
            size === "hero" ? "text-4xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-9 flex flex-wrap justify-center gap-4">{actions}</div> : null}
      </div>
    </section>
  );
}

/** Centred section heading used by every marketing section. */
export function CenteredHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id?: string | undefined;
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
}) {
  return (
    <header className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold tracking-[0.24em] uppercase text-gold">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="text-3xl font-extrabold text-primary sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <span className="mx-auto mt-6 block h-1 w-20 rounded-full bg-gold" aria-hidden="true" />
    </header>
  );
}

/** Image-on-top feature card, three per row on desktop. */
export function FeatureCard({
  image,
  title,
  body,
}: {
  image: string;
  title: string;
  body: string;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-xl">
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 text-center">
        <h3 className="text-lg font-bold text-primary">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

/** Text beside a large rounded photograph. */
export function SplitFeature({
  image,
  imageAlt,
  reverse = false,
  children,
}: {
  image: string;
  imageAlt: string;
  reverse?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className={cn(reverse && "lg:order-2")}>{children}</div>
      <div className={cn("overflow-hidden rounded-3xl shadow-xl", reverse && "lg:order-1")}>
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] size-full object-cover"
        />
      </div>
    </div>
  );
}

/** Subject / tag chips used on the curriculum blocks. */
export function ChipList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-primary/15 bg-navy-soft px-4 py-2 text-sm font-medium text-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Floating WhatsApp-style contact button, bottom right. */
export function FloatingContact({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.34.99 2.5c.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
