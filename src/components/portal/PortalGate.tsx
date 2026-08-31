import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { AuthGate } from "@/components/admissions/AuthGate";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccess, type AccessSnapshot } from "@/lib/access";

/**
 * Wraps a portal in sign-in plus a client-side eligibility check.
 * Row Level Security in the database is the real boundary - this only decides
 * which shell to render so people are not shown empty screens.
 */
export function PortalGate({
  title,
  description,
  eligible,
  notEligibleTitle,
  notEligibleDescription,
  children,
}: {
  title: string;
  description: string;
  eligible: (ctx: { user: User; access: AccessSnapshot }) => boolean | Promise<boolean>;
  notEligibleTitle: string;
  notEligibleDescription: string;
  children: (ctx: { user: User; access: AccessSnapshot }) => ReactNode;
}) {
  return (
    <AuthGate title={title} description={description}>
      {(user) => (
        <GateBody
          user={user}
          eligible={eligible}
          notEligibleTitle={notEligibleTitle}
          notEligibleDescription={notEligibleDescription}
        >
          {children}
        </GateBody>
      )}
    </AuthGate>
  );
}

function GateBody({
  user,
  eligible,
  notEligibleTitle,
  notEligibleDescription,
  children,
}: {
  user: User;
  eligible: (ctx: { user: User; access: AccessSnapshot }) => boolean | Promise<boolean>;
  notEligibleTitle: string;
  notEligibleDescription: string;
  children: (ctx: { user: User; access: AccessSnapshot }) => ReactNode;
}) {
  const { access, loading } = useAccess(user.id);

  if (loading) {
    return (
      <div className="container-page space-y-4 py-16">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const allowed = eligible({ user, access });
  if (allowed !== true) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={notEligibleTitle}
          description={notEligibleDescription}
          action={
            <Button asChild variant="outline">
              <Link to="/">Back to the website</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children({ user, access })}</>;
}
