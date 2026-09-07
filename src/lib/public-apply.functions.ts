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
