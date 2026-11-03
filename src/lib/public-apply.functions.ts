import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Account-free admissions.
 *
 * Applicants never sign in: the public form posts here, the server writes the
 * application with a privileged client, and the applicant gets a reference
 * code back. Tracking uses reference code + the guardian email on the record.
 */

const submissionSchema = z.object({
  student_first_name: z.string().trim().min(1).max(80),
  student_last_name: z.string().trim().min(1).max(80),
  student_dob: z.string().trim().min(1).max(20),
  gender: z.string().trim().max(40).optional().default(""),
  nationality: z.string().trim().max(80).optional().default(""),
  home_address: z.string().trim().max(300).optional().default(""),
  guardian_name: z.string().trim().min(1).max(120),
  guardian_email: z.string().trim().email().max(255),
  guardian_phone: z.string().trim().min(6).max(40),
  guardian_relationship: z.string().trim().max(60).optional().default(""),
  period_id: z.string().uuid().nullable().optional().default(null),
  grade_level_id: z.string().uuid().nullable().optional().default(null),
  previous_school: z.string().trim().max(160).optional().default(""),
  previous_grade: z.string().trim().max(60).optional().default(""),
  medical_notes: z.string().trim().max(1000).optional().default(""),
  message: z.string().trim().max(1000).optional().default(""),
});

export type PublicApplicationInput = z.input<typeof submissionSchema>;

export const submitPublicApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: reference, error: referenceError } = await supabaseAdmin.rpc(
      "next_application_reference",
    );
    if (referenceError) throw new Error(referenceError.message);

    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin
      .from("applications")
      .insert({
        reference_code: reference as string,
        applicant_user_id: null,
        period_id: data.period_id ?? null,
        grade_level_id: data.grade_level_id ?? null,
        status: "submitted",
        current_step: 5,
        submitted_at: now,
        student_first_name: data.student_first_name,
        student_last_name: data.student_last_name,
        student_dob: data.student_dob,
        guardian_name: data.guardian_name,
        guardian_email: data.guardian_email,
        guardian_phone: data.guardian_phone,
        form_data: {
          gender: data.gender,
          nationality: data.nationality,
          home_address: data.home_address,
          guardian_relationship: data.guardian_relationship,
          previous_school: data.previous_school,
          previous_grade: data.previous_grade,
          medical_notes: data.medical_notes,
          message: data.message,
          source: "public_form",
        },
      })
      .select("id, reference_code")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id, reference: row.reference_code as string };
  });

const lookupSchema = z.object({
  reference: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(255),
});

export const trackPublicApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("applications")
      .select(
        "reference_code, status, submitted_at, updated_at, student_first_name, student_last_name, decision_note",
      )
      .eq("reference_code", data.reference.toUpperCase())
      .ilike("guardian_email", data.email)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return row;
  });

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const uploadSchema = z.object({
  application_id: z.string().uuid(),
  reference: z.string().trim().min(3).max(40),
  file_name: z.string().trim().min(1).max(160),
  mime_type: z.string().refine((t) => ALLOWED_TYPES.includes(t), "Only PDF or image files"),
  base64: z.string().min(1).max(7_000_000), // about 5 MB
});

/** Attach one supporting document to a just-submitted public application. */
export const uploadPublicApplicationDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // The caller must know both the id and reference of a recently submitted application.
    const { data: app } = await supabaseAdmin
      .from("applications")
      .select("id, submitted_at")
      .eq("id", data.application_id)
      .eq("reference_code", data.reference.toUpperCase())
      .maybeSingle();
    if (!app || !app.submitted_at || Date.now() - new Date(app.submitted_at).getTime() > 2 * 60 * 60 * 1000) {
      throw new Error("Uploads are only possible right after sending the application.");
    }
    const { count } = await supabaseAdmin.from("application_documents").select("id", { count: "exact", head: true }).eq("application_id", app.id);
    if ((count ?? 0) >= 10) throw new Error("A maximum of 10 documents can be attached.");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Each file must be 5 MB or smaller.");
    const safe = data.file_name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const path = `public/${app.id}/${crypto.randomUUID()}-${safe}`;
    const { error: upErr } = await supabaseAdmin.storage.from("application-documents").upload(path, bytes, { contentType: data.mime_type });
    if (upErr) throw new Error("Upload failed. Please try again.");
    const { error } = await supabaseAdmin.from("application_documents").insert({
      application_id: app.id, doc_type: "supporting", file_name: data.file_name, mime_type: data.mime_type,
      size_bytes: bytes.byteLength, storage_path: path, status: "pending", uploaded_by: null,
    });
    if (error) throw new Error("Could not save the document.");
    return { ok: true };
  });
