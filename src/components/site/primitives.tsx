import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  tone = "default",
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string | undefined;
  tone?: "default" | "muted" | "navy" | "forest" | undefined;
  id?: string | undefined;
  labelledBy?: string | undefined;
}) {
  const tones = {
    default: "bg-background",
    muted: "bg-muted/50",
    navy: "brand-gradient text-primary-foreground",
    forest: "bg-forest-soft",
  } as const;
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 sm:py-20", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  inverted = false,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  align?: "left" | "center" | undefined;
  id?: string | undefined;
  inverted?: boolean | undefined;
}) {
  return (
    <header
      className={cn(
        "mb-10 max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold tracking-[0.18em] uppercase",
            inverted ? "text-primary-foreground/70" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-3xl font-semibold sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            inverted ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <div className="brand-gradient text-primary-foreground">
      <div className="container-page py-16 sm:py-24">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/70">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}

export function Prose({ text, className }: { text?: string | null | undefined; className?: string | undefined }) {
  if (!text) return null;
  return (
    <div className={cn("space-y-4 text-base leading-relaxed text-muted-foreground", className)}>
      {text
        .split(/\n{2,}/)
        .map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}

export function MediaFrame({
  src,
  alt,
  className,
  ratio = "aspect-[4/3]",
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string | undefined;
  ratio?: string | undefined;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-navy-soft", ratio, className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      ) : (
        <div className="flex size-full items-center justify-center px-4 text-center text-xs font-medium text-muted-foreground">
          Image placeholder — add artwork in the admin area
        </div>
      )}
    </div>
  );
}
