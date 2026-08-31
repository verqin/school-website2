/**
 * Centralised authorization for the Sample1 platform.
 *
 * The database is the real boundary: every table has RLS policies built on
 * public.can('permission'). This module mirrors the same permission map on the
 * client so navigation and controls can be hidden, never as a security check.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "super_admin"
  | "admin"
  | "administrator"
  | "principal"
  | "deputy_principal"
  | "admissions_officer"
  | "finance_officer"
  | "teacher"
  | "class_teacher"
  | "librarian"
  | "parent"
  | "student"
  | "editor"
  | "viewer";

export type Permission =
  | "students.view"
  | "students.create"
  | "students.edit"
  | "students.archive"
  | "parents.manage"
  | "staff.manage"
  | "academics.view"
  | "academics.manage"
  | "attendance.view"
  | "attendance.manage"
  | "grades.enter"
  | "grades.approve"
  | "reports.publish"
  | "examinations.manage"
  | "finance.view"
  | "finance.manage"
  | "payments.record"
  | "admissions.manage"
  | "enrollment.manage"
  | "announcements.manage"
  | "library.manage"
  | "discipline.manage"
  | "documents.manage"
  | "settings.manage";

export const roleLabels: Record<string, string> = {
  super_admin: "Super administrator",
  admin: "Administrator",
  administrator: "Administrator",
  principal: "Principal",
  deputy_principal: "Deputy principal",
  admissions_officer: "Admissions officer",
  finance_officer: "Finance officer",
  teacher: "Teacher",
  class_teacher: "Class teacher",
  librarian: "Librarian",
  parent: "Parent / guardian",
  student: "Student",
  editor: "Content editor",
  viewer: "Viewer",
};

export type AccessSnapshot = {
  roles: string[];
  permissions: Set<string>;
  isSuper: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  hasRole: (role: AppRole) => boolean;
};

const emptyAccess: AccessSnapshot = {
  roles: [],
  permissions: new Set(),
  isSuper: false,
  can: () => false,
  canAny: () => false,
  hasRole: () => false,
};

function build(roles: string[], permissions: string[]): AccessSnapshot {
  const set = new Set(permissions);
  const isSuper = set.has("*");
  const can = (permission: Permission) => isSuper || set.has(permission);
  return {
    roles,
    permissions: set,
    isSuper,
    can,
    canAny: (list) => list.some(can),
    hasRole: (role) => roles.includes(role),
  };
}

/** Loads the signed-in user's roles and the permissions those roles grant. */
export function useAccess(userId: string | undefined) {
  const query = useQuery({
    queryKey: ["access", userId ?? "anon"],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async (): Promise<AccessSnapshot> => {
      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (roleError) throw roleError;
      const roles = (roleRows ?? []).map((r) => r.role as string);
      if (roles.length === 0) return build([], []);

      const { data: permRows, error: permError } = await supabase
        .from("role_permissions")
        .select("permission, role")
        .in("role", roles as never[]);
      if (permError) throw permError;
      return build(roles, (permRows ?? []).map((p) => p.permission));
    },
  });

  return { access: query.data ?? emptyAccess, loading: query.isLoading, error: query.error };
}

/** Friendly, non-technical message for a blocked action. */
export const accessDeniedMessage =
  "You do not have permission to view this. If you believe this is a mistake, contact the school office.";
