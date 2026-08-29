import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type Application = Tables["applications"]["Row"];
export type ApplicationDocument = Tables["application_documents"]["Row"];
export type DocumentRequest = Tables["application_document_requests"]["Row"];
export type ApplicationNote = Tables["application_notes"]["Row"];
export type ApplicationInterview = Tables["application_interviews"]["Row"];
export type StatusHistory = Tables["application_status_history"]["Row"];
export type AuditEntry = Tables["application_audit_log"]["Row"];
export type Notification = Tables["applicant_notifications"]["Row"];
export type AdmissionsPeriod = Tables["admissions_periods"]["Row"];
export type GradeLevel = Tables["grade_levels"]["Row"];
export type Requirement = Tables["admissions_requirements"]["Row"];
export type AdmissionsSetting = Tables["admissions_settings"]["Row"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "documents_requested",
  "interview_scheduled",
  "interviewed",
  "accepted",
  "waitlisted",
  "rejected",
  "withdrawn",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  documents_requested: "Documents requested",
  interview_scheduled: "Interview scheduled",
  interviewed: "Interviewed",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Not offered a place",
  withdrawn: "Withdrawn",
};

/** Ordered timeline used on the applicant status page. */
export const STATUS_TIMELINE: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "interview_scheduled",
  "interviewed",
];

export const EDITABLE_STATUSES: ApplicationStatus[] = ["draft", "documents_requested"];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const TOTAL_STEPS = 5;
export const STEP_TITLES = [
  "Student details",
  "Parent / guardian",
  "Academic background",
  "Documents",
  "Review & submit",
];

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const trimmed = (max: number) => z.string().trim().max(max);

export const stepOneSchema = z.object({
  student_first_name: trimmed(80).min(1, "Student first name is required"),
  student_last_name: trimmed(80).min(1, "Student last name is required"),
  student_dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date < new Date() && date > new Date("1950-01-01");
    }, "Enter a valid date of birth"),
  gender: trimmed(40).optional(),
  nationality: trimmed(80).optional(),
  home_address: trimmed(300).optional(),
});

export const stepTwoSchema = z.object({
  guardian_name: trimmed(120).min(1, "Parent / guardian name is required"),
  guardian_email: trimmed(255).email("Enter a valid email address"),
  guardian_phone: trimmed(40).min(6, "Enter a contact phone number"),
  guardian_relationship: trimmed(60).optional(),
  alternate_contact: trimmed(160).optional(),
});

export const stepThreeSchema = z.object({
  period_id: z.string().uuid("Choose an admissions intake"),
  grade_level_id: z.string().uuid("Choose a grade level"),
  previous_school: trimmed(160).optional(),
  previous_grade: trimmed(60).optional(),
  achievements: trimmed(1000).optional(),
  medical_notes: trimmed(1000).optional(),
  referral_source: trimmed(120).optional(),
});

export type StepOneValues = z.infer<typeof stepOneSchema>;
export type StepTwoValues = z.infer<typeof stepTwoSchema>;
export type StepThreeValues = z.infer<typeof stepThreeSchema>;

export function validateFile(file: File): string | null {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return "Only PDF, JPEG, PNG or WebP files are accepted.";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "Files must be 10 MB or smaller.";
  }
  if (file.size === 0) return "This file appears to be empty.";
  return null;
}

/* -------------------------------------------------------------------------- */
/* Public configuration queries                                               */
/* -------------------------------------------------------------------------- */

export const periodsQuery = () =>
  queryOptions({
    queryKey: ["admissions", "periods"],
    queryFn: async () =>
      unwrap<AdmissionsPeriod[]>(
        await supabase
          .from("admissions_periods")
          .select("*")
          .eq("is_active", true)
          .order("opens_at", { ascending: false }),
      ),
  });

export const gradeLevelsQuery = () =>
  queryOptions({
    queryKey: ["admissions", "grades"],
    queryFn: async () =>
      unwrap<GradeLevel[]>(
        await supabase
          .from("grade_levels")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ),
  });

export const requirementsQuery = () =>
  queryOptions({
    queryKey: ["admissions", "requirements"],
    queryFn: async () =>
      unwrap<Requirement[]>(
        await supabase
          .from("admissions_requirements")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ),
  });

export const admissionsSettingsQuery = () =>
  queryOptions({
    queryKey: ["admissions", "settings"],
    queryFn: async () =>
      unwrap<AdmissionsSetting[]>(
        await supabase.from("admissions_settings").select("*").order("key"),
      ),
  });

export function requirementsFor(
  requirements: Requirement[],
  periodId: string | null,
  gradeLevelId: string | null,
) {
  return requirements.filter(
    (r) =>
      (r.period_id === null || r.period_id === periodId) &&
      (r.grade_level_id === null || r.grade_level_id === gradeLevelId),
  );
}

/* -------------------------------------------------------------------------- */
/* Applicant queries (RLS scopes every read to the signed-in user)            */
/* -------------------------------------------------------------------------- */

export const myApplicationsQuery = () =>
  queryOptions({
    queryKey: ["applications", "mine"],
    queryFn: async () =>
      unwrap<Application[]>(
        await supabase
          .from("applications")
          .select("*")
          .order("created_at", { ascending: false }),
      ),
  });

/**
 * Single application. RLS guarantees a caller can only ever read their own
 * application (or any application when they are staff) — an unauthorised id
 * simply returns null, which the routes render as "not found".
 */
export const applicationQuery = (id: string) =>
  queryOptions({
    queryKey: ["applications", "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Application | null;
    },
  });

export const applicationDocumentsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["applications", "documents", applicationId],
    queryFn: async () =>
      unwrap<ApplicationDocument[]>(
        await supabase
          .from("application_documents")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: true }),
      ),
  });

export const documentRequestsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["applications", "doc-requests", applicationId],
    queryFn: async () =>
      unwrap<DocumentRequest[]>(
        await supabase
          .from("application_document_requests")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false }),
      ),
  });

export const statusHistoryQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["applications", "history", applicationId],
    queryFn: async () =>
      unwrap<StatusHistory[]>(
        await supabase
          .from("application_status_history")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false }),
      ),
  });

/** Applicants must never see staff interview notes, so columns are projected. */
export const applicantInterviewsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["applications", "interviews", "applicant", applicationId],
    queryFn: async () =>
      unwrap<
        Pick<
          ApplicationInterview,
          "id" | "scheduled_at" | "duration_minutes" | "mode" | "location" | "interviewer_name" | "status"
        >[]
      >(
        await supabase
          .from("application_interviews")
          .select("id, scheduled_at, duration_minutes, mode, location, interviewer_name, status")
          .eq("application_id", applicationId)
          .order("scheduled_at", { ascending: true }),
      ),
  });

export const notificationsQuery = () =>
  queryOptions({
    queryKey: ["notifications"],
    queryFn: async () =>
      unwrap<Notification[]>(
        await supabase
          .from("applicant_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ),
  });

/* -------------------------------------------------------------------------- */
/* Staff queries                                                              */
/* -------------------------------------------------------------------------- */

export type AdminFilters = {
  search?: string;
  status?: ApplicationStatus | "all";
  periodId?: string | "all";
  gradeLevelId?: string | "all";
  assignment?: "all" | "unassigned" | "mine";
  page?: number;
  pageSize?: number;
  userId?: string | null;
};

/** All filtering, searching and paging is executed by the database. */
export const adminApplicationsQuery = (filters: AdminFilters) =>
  queryOptions({
    queryKey: ["admin", "applications", filters],
    queryFn: async () => {
      const pageSize = filters.pageSize ?? 20;
      const page = Math.max(0, filters.page ?? 0);
      let q = supabase
        .from("applications")
        .select("*", { count: "exact" })
        .neq("status", "draft");

      if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
      if (filters.periodId && filters.periodId !== "all") q = q.eq("period_id", filters.periodId);
      if (filters.gradeLevelId && filters.gradeLevelId !== "all")
        q = q.eq("grade_level_id", filters.gradeLevelId);
      if (filters.assignment === "unassigned") q = q.is("assigned_to", null);
      if (filters.assignment === "mine" && filters.userId) q = q.eq("assigned_to", filters.userId);

      const search = filters.search?.trim();
      if (search) {
        const safe = search.replace(/[%,()]/g, " ");
        q = q.or(
          [
            `reference_code.ilike.%${safe}%`,
            `student_first_name.ilike.%${safe}%`,
            `student_last_name.ilike.%${safe}%`,
            `guardian_name.ilike.%${safe}%`,
            `guardian_email.ilike.%${safe}%`,
          ].join(","),
        );
      }

      const { data, error, count } = await q
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as Application[], count: count ?? 0, page, pageSize };
    },
  });

export const adminStatsQuery = () =>
  queryOptions({
    queryKey: ["admin", "applications", "stats"],
    queryFn: async () => {
      const counts = await Promise.all(
        APPLICATION_STATUSES.map(async (status) => {
          const { count, error } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("status", status);
          if (error) throw new Error(error.message);
          return [status, count ?? 0] as const;
        }),
      );
      const { count: pendingDocs } = await supabase
        .from("application_documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return {
        byStatus: Object.fromEntries(counts) as Record<ApplicationStatus, number>,
        pendingDocuments: pendingDocs ?? 0,
      };
    },
  });

export const adminNotesQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["admin", "notes", applicationId],
    queryFn: async () =>
      unwrap<ApplicationNote[]>(
        await supabase
          .from("application_notes")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false }),
      ),
  });

export const adminInterviewsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["admin", "interviews", applicationId],
    queryFn: async () =>
      unwrap<ApplicationInterview[]>(
        await supabase
          .from("application_interviews")
          .select("*")
          .eq("application_id", applicationId)
          .order("scheduled_at", { ascending: false }),
      ),
  });

export const adminAuditQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["admin", "audit", applicationId],
    queryFn: async () =>
      unwrap<AuditEntry[]>(
        await supabase
          .from("application_audit_log")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false })
          .limit(200),
      ),
  });

export const staffDirectoryQuery = () =>
  queryOptions({
    queryKey: ["admin", "reviewers"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "editor"]);
      if (error) throw new Error(error.message);
      const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
      if (ids.length === 0) return [] as { id: string; name: string }[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      return ids.map((id) => ({
        id,
        name: profiles?.find((p) => p.id === id)?.full_name ?? "Staff member",
      }));
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export async function createApplication(userId: string, periodId: string | null) {
  const { data, error } = await supabase
    .from("applications")
    .insert({ applicant_user_id: userId, status: "draft", period_id: periodId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Application;
}

export async function saveApplicationDraft(
  id: string,
  patch: Partial<Tables["applications"]["Update"]>,
) {
  const { data, error } = await supabase
    .from("applications")
    .update({ ...patch, last_autosaved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("This application can no longer be edited.");
  return data as Application;
}

export async function submitApplication(id: string) {
  const { data, error } = await supabase.rpc("submit_application", { _application_id: id });
  if (error) throw new Error(error.message);
  return data as unknown as Application;
}

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
  note?: string,
) {
  const { data, error } = await supabase.rpc("set_application_status", {
    _application_id: id,
    _status: status,
    ...(note ? { _note: note } : {}),
  });
  if (error) throw new Error(error.message);
  return data as unknown as Application;
}

export async function uploadApplicationDocument(params: {
  userId: string;
  applicationId: string;
  requirementId: string | null;
  docType: string;
  file: File;
}) {
  const problem = validateFile(params.file);
  if (problem) throw new Error(problem);
  const extension = params.file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "bin";
  const path = `${params.userId}/${params.applicationId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("application-documents")
    .upload(path, params.file, { contentType: params.file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("application_documents").insert({
    application_id: params.applicationId,
    requirement_id: params.requirementId,
    doc_type: params.docType,
    file_name: params.file.name.slice(0, 180),
    storage_path: path,
    mime_type: params.file.type,
    size_bytes: params.file.size,
    uploaded_by: params.userId,
  });
  if (error) {
    await supabase.storage.from("application-documents").remove([path]);
    throw new Error(error.message);
  }
  return path;
}

export async function deleteApplicationDocument(doc: ApplicationDocument) {
  const { error } = await supabase.from("application_documents").delete().eq("id", doc.id);
  if (error) throw new Error(error.message);
  await supabase.storage.from("application-documents").remove([doc.storage_path]);
}

/** Short-lived signed URL — the bucket itself is private. */
export async function signedDocumentUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("application-documents")
    .createSignedUrl(path, 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function verifyDocument(
  documentId: string,
  status: DocumentStatus,
  reason?: string,
) {
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("application_documents")
    .update({
      status,
      rejection_reason: status === "rejected" ? (reason ?? null) : null,
      verified_by: user.user?.id ?? null,
      verified_at: new Date().toISOString(),
    })
    .eq("id", documentId);
  if (error) throw new Error(error.message);
}

export async function requestDocuments(params: {
  applicationId: string;
  applicantUserId: string;
  label: string;
  message: string;
  staffId: string;
}) {
  const { error } = await supabase.from("application_document_requests").insert({
    application_id: params.applicationId,
    label: params.label.slice(0, 160),
    message: params.message.slice(0, 1000),
    requested_by: params.staffId,
  });
  if (error) throw new Error(error.message);
  await setApplicationStatus(
    params.applicationId,
    "documents_requested",
    `Requested: ${params.label}`,
  );
}

export async function addInternalNote(applicationId: string, staffId: string, body: string) {
  const { error } = await supabase.from("application_notes").insert({
    application_id: applicationId,
    author_id: staffId,
    body: body.trim().slice(0, 4000),
  });
  if (error) throw new Error(error.message);
  await logAudit(applicationId, staffId, "note.added", {});
}

export async function assignApplication(
  applicationId: string,
  staffId: string,
  assignee: string | null,
) {
  const { error } = await supabase
    .from("applications")
    .update({ assigned_to: assignee })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  await logAudit(applicationId, staffId, "application.assigned", { assignee });
}

export async function scheduleInterview(params: {
  applicationId: string;
  applicantUserId: string;
  staffId: string;
  scheduledAt: string;
  mode: string;
  location: string;
  interviewerName: string;
  durationMinutes: number;
}) {
  const { error } = await supabase.from("application_interviews").insert({
    application_id: params.applicationId,
    scheduled_at: new Date(params.scheduledAt).toISOString(),
    duration_minutes: params.durationMinutes,
    mode: params.mode,
    location: params.location.slice(0, 200),
    interviewer_name: params.interviewerName.slice(0, 120),
    created_by: params.staffId,
  });
  if (error) throw new Error(error.message);
  await setApplicationStatus(params.applicationId, "interview_scheduled", "Interview scheduled");
}

export async function recordInterviewOutcome(
  interviewId: string,
  applicationId: string,
  staffId: string,
  outcome: string,
  staffNotes: string,
) {
  const { error } = await supabase
    .from("application_interviews")
    .update({ status: "completed", outcome: outcome.slice(0, 400), staff_notes: staffNotes.slice(0, 4000) })
    .eq("id", interviewId);
  if (error) throw new Error(error.message);
  await logAudit(applicationId, staffId, "interview.completed", { interviewId });
}

export async function markNotificationRead(id: string) {
  await supabase.from("applicant_notifications").update({ is_read: true }).eq("id", id);
}

export async function logAudit(
  applicationId: string,
  actorId: string,
  action: string,
  detail: Record<string, unknown>,
) {
  await supabase.from("application_audit_log").insert({
    application_id: applicationId,
    actor_id: actorId,
    action,
    detail: detail as never,
  });
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function completionPercent(app: Application, documentCount: number) {
  const checks = [
    Boolean(app.student_first_name && app.student_last_name && app.student_dob),
    Boolean(app.guardian_name && app.guardian_email && app.guardian_phone),
    Boolean(app.period_id && app.grade_level_id),
    documentCount > 0,
    app.status !== "draft",
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function formDataValue(app: Application, key: string) {
  const data = (app.form_data ?? {}) as Record<string, unknown>;
  const value = data[key];
  return typeof value === "string" ? value : "";
}
