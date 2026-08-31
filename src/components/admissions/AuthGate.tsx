import { useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type Mode = "signin" | "signup";

/**
 * Client-side gate for the applicant portal and the staff area.
 * The real security boundary is Row Level Security in the database - this only
 * decides what UI to render.
 */
export function AuthGate({
  title,
  description,
  allowSignUp = false,
  requireStaff = false,
  children,
}: {
  title: string;
  description: string;
  allowSignUp?: boolean | undefined;
  requireStaff?: boolean | undefined;
  children: (user: User) => ReactNode;
}) {
  const { user, loading } = useSupabaseUser();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  if (!loading && user && requireStaff && isStaff === null) {
    void supabase.rpc("is_staff", { _user_id: user.id }).then(({ data }) => {
      setIsStaff(Boolean(data));
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().slice(0, 255);
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("full_name") ?? "").trim().slice(0, 120);
    if (!email || password.length < 8) {
      setError("Enter your email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/apply`,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage("Account created. If email confirmation is required you will need to confirm before signing in.");
      setMode("signin");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) setError(signInError.message);
  }

  if (loading) {
    return (
      <div className="container-page py-20" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-32 w-full max-w-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            {mode === "signup" ? (
              <div className="grid gap-2">
                <Label htmlFor="gate-name">Full name</Label>
                <Input id="gate-name" name="full_name" autoComplete="name" maxLength={120} />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="gate-email">Email</Label>
              <Input id="gate-email" name="email" type="email" required autoComplete="email" maxLength={255} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gate-password">Password</Label>
              <Input
                id="gate-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
            <p aria-live="polite" className="text-sm text-destructive">
              {error}
            </p>
            {message ? (
              <p aria-live="polite" className="text-sm text-secondary">
                {message}
              </p>
            ) : null}
          </form>
          {allowSignUp ? (
            <button
              type="button"
              className="mt-4 text-sm underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
            >
              {mode === "signin" ? "New applicant? Create an account" : "Already have an account? Sign in"}
            </button>
          ) : null}
          <div className="mt-6 text-sm">
            <Link to="/" className="underline-offset-4 hover:underline">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requireStaff && isStaff !== true) {
    return (
      <div className="container-page py-20">
        {isStaff === null ? (
          <p className="text-sm text-muted-foreground">Checking your permissions…</p>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h1 className="text-lg font-semibold">Staff access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This account does not have the editor or admin role. Ask an administrator for access.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => void supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children(user)}</>;
}

export async function signOutAndReload() {
  await supabase.auth.signOut();
}
