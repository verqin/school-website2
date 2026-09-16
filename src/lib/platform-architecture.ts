export const platformArchitecture = {
  tenant: {
    school: "Cresta Reign Academy",
    schoolType: "Secondary day school",
    location: "Glenview-Mufakose District, Harare Province, Zimbabwe",
    currency: "USD",
    timezone: "Africa/Harare",
  },
  roles: [
    "SUPER_ADMIN",
    "SCHOOL_OWNER",
    "PRINCIPAL",
    "DEPUTY_PRINCIPAL",
    "BURSAR",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "RECEPTIONIST",
    "STOREKEEPER",
    "SECURITY",
  ],
  modules: [
    { name: "Identity & RBAC", tables: ["profiles", "roles", "permissions", "user_roles"], status: "Designed" },
    { name: "School structure", tables: ["schools", "academic_years", "terms", "grades", "classes", "subjects", "departments", "houses"], status: "Designed" },
    { name: "Admissions", tables: ["applications", "application_academic_history", "application_notes", "interviews", "admission_decisions", "physical_document_receipts"], status: "Designed" },
    { name: "Student life", tables: ["students", "guardians", "student_guardians", "enrollments", "attendance", "discipline_records"], status: "Designed" },
    { name: "Academics", tables: ["assessments", "marks", "grade_scales", "report_cards", "report_card_comments"], status: "Designed" },
    { name: "Finance", tables: ["fee_structures", "invoices", "invoice_lines", "payments", "ledger_entries", "receipts"], status: "Designed" },
    { name: "Operations", tables: ["inventory", "stock_movements", "procurement_requests", "visitors", "calendar_events", "notifications"], status: "Designed" },
    { name: "Governance", tables: ["audit_logs", "security_events", "approval_requests", "data_exports"], status: "Designed" },
  ],
  securityControls: [
    "Every school-owned record carries school_id for tenant isolation.",
    "RLS policies must scope records to the signed-in user's school and role permissions.",
    "Parents can only read students linked through student_guardians.",
    "Passwords remain exclusively in Supabase Auth; application tables never store passwords.",
    "Financial changes use an immutable ledger and server-side transactions.",
    "Uploads use private storage buckets, MIME validation, size limits, and signed URLs.",
    "Sensitive actions are recorded in audit_logs with actor, target, action, and timestamp.",
    "AI tools must use permission-filtered, minimised records and never expose secrets.",
  ],
  constraints: [
    "Houses are competition structures only; boarding and dormitory data are intentionally excluded.",
    "Money uses numeric decimal values, never floating-point arithmetic.",
    "Student identifiers are unique per school and active enrolments cannot be duplicated for a year.",
    "Admissions academic history is relational, with one row per subject and result.",
    "Archived records remain auditable and are not hard-deleted by normal staff actions.",
  ],
} as const;

export type PlatformRole = (typeof platformArchitecture.roles)[number];
export type PlatformModule = (typeof platformArchitecture.modules)[number];

export function downloadArchitectureBrief() {
  const content = [
    "CRESTA REIGN ACADEMY — DIGITAL SCHOOL OPERATING SYSTEM",
    "Phase 3 architecture brief",
    "",
    `Tenant: ${platformArchitecture.tenant.school}`,
    `Location: ${platformArchitecture.tenant.location}`,
    `Type: ${platformArchitecture.tenant.schoolType}`,
    "",
    "MODULES",
    ...platformArchitecture.modules.map((module) => `${module.name}: ${module.tables.join(", ")}`),
    "",
    "SECURITY CONTROLS",
    ...platformArchitecture.securityControls.map((control) => `- ${control}`),
    "",
    "BUSINESS CONSTRAINTS",
    ...platformArchitecture.constraints.map((constraint) => `- ${constraint}`),
  ].join("\\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cresta-reign-academy-phase-3-architecture.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}
