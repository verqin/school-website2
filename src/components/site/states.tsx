import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeletonGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5">
          <Skeleton className="mb-4 h-40 w-full rounded-lg" />
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
      <span className="sr-only">Loading content…</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/40 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-navy-soft text-primary">
        {icon ?? <Inbox className="size-5" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this content",
  description = "Something went wrong while contacting the server. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/** Marks content that must be supplied by the school before launch. */
export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-gold/40 bg-gold/5 px-4 py-3 text-sm text-muted-foreground">
      <span className="font-semibold text-gold">Placeholder:</span> {children}
    </p>
  );
}
