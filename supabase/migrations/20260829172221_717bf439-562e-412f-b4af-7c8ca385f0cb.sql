-- Extend the role list
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'administrator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'principal';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputy_principal';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admissions_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'class_teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'librarian';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- New domain enums
DO $$ BEGIN
  CREATE TYPE public.student_status AS ENUM ('applicant','enrolled','active','suspended','transferred','graduated','withdrawn','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.enrollment_stage AS ENUM ('pending','documentation','requirements','confirmed','active','paused','rejected','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.assessment_type AS ENUM ('quiz','test','assignment','project','continuous','practical','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.publication_state AS ENUM ('draft','submitted','reviewed','approved','published','unpublished');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('draft','issued','partially_paid','paid','overdue','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.discipline_status AS ENUM ('open','under_review','resolved','escalated','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.loan_status AS ENUM ('borrowed','returned','overdue','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.audience_scope AS ENUM ('everyone','parents','students','teachers','staff','grade','class');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.guardian_relationship AS ENUM ('mother','father','guardian','grandparent','sibling','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;