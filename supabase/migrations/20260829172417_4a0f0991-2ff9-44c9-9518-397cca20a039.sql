-- ============ PERMISSIONS ============
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can read permission map" ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  )
$$;

CREATE OR REPLACE FUNCTION public.can(_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_permission(auth.uid(), _permission)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','editor','super_admin','administrator','principal','deputy_principal',
                   'admissions_officer','finance_officer','teacher','class_teacher','librarian')
  )
$$;

INSERT INTO public.role_permissions (role, permission)
SELECT r.role::public.app_role, p.permission FROM (VALUES
  ('super_admin','*'),
  ('admin','*'),
  ('administrator','students.view'),('administrator','students.create'),('administrator','students.edit'),
  ('administrator','students.archive'),('administrator','parents.manage'),('administrator','staff.manage'),
  ('administrator','academics.view'),('administrator','academics.manage'),('administrator','attendance.view'),
  ('administrator','attendance.manage'),('administrator','grades.approve'),('administrator','reports.publish'),
  ('administrator','examinations.manage'),('administrator','admissions.manage'),('administrator','announcements.manage'),
  ('administrator','settings.manage'),('administrator','library.manage'),('administrator','discipline.manage'),
  ('administrator','documents.manage'),('administrator','enrollment.manage'),('administrator','finance.view'),
  ('principal','students.view'),('principal','academics.view'),('principal','attendance.view'),
  ('principal','grades.approve'),('principal','reports.publish'),('principal','finance.view'),
  ('principal','staff.manage'),('principal','admissions.manage'),('principal','announcements.manage'),
  ('principal','discipline.manage'),('principal','examinations.manage'),('principal','enrollment.manage'),
  ('deputy_principal','students.view'),('deputy_principal','academics.view'),('deputy_principal','attendance.view'),
  ('deputy_principal','grades.approve'),('deputy_principal','discipline.manage'),('deputy_principal','announcements.manage'),
  ('admissions_officer','admissions.manage'),('admissions_officer','students.view'),('admissions_officer','enrollment.manage'),
  ('finance_officer','finance.view'),('finance_officer','finance.manage'),('finance_officer','payments.record'),
  ('finance_officer','students.view'),
  ('teacher','academics.view'),('teacher','attendance.manage'),('teacher','grades.enter'),('teacher','students.view'),
  ('class_teacher','academics.view'),('class_teacher','attendance.manage'),('class_teacher','grades.enter'),
  ('class_teacher','students.view'),('class_teacher','discipline.manage'),
  ('librarian','library.manage'),('librarian','students.view'),
  ('editor','announcements.manage')
) AS p(role, permission) CROSS JOIN LATERAL (SELECT p.role AS role) r
ON CONFLICT DO NOTHING;

-- '*' shortcut support
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission IN (_permission, '*')
  )
$$;

-- ============ ACADEMIC STRUCTURE ============
CREATE TABLE public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT ALL ON public.academic_years TO service_role;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage academic years" ON public.academic_years FOR ALL TO authenticated USING (public.can('settings.manage')) WITH CHECK (public.can('settings.manage'));
CREATE TRIGGER academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terms TO authenticated;
GRANT ALL ON public.terms TO service_role;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read terms" ON public.terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage terms" ON public.terms FOR ALL TO authenticated USING (public.can('settings.manage')) WITH CHECK (public.can('settings.manage'));
CREATE TRIGGER terms_updated_at BEFORE UPDATE ON public.terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage departments" ON public.departments FOR ALL TO authenticated USING (public.can('settings.manage')) WITH CHECK (public.can('settings.manage'));
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  academic_level text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subject_grade_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_level_id uuid NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_id, grade_level_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subject_grade_levels TO authenticated;
GRANT ALL ON public.subject_grade_levels TO service_role;
ALTER TABLE public.subject_grade_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read subject grades" ON public.subject_grade_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage subject grades" ON public.subject_grade_levels FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));

-- ============ STAFF ============
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_no text NOT NULL UNIQUE,
  full_name text NOT NULL,
  position text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  email text,
  phone text,
  employment_status text NOT NULL DEFAULT 'active',
  photo_url text,
  qualifications text,
  public_profile_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read own record" ON public.staff FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Read staff directory" ON public.staff FOR SELECT TO authenticated USING (public.can('staff.manage') OR public.can('academics.view'));
CREATE POLICY "Manage staff" ON public.staff FOR ALL TO authenticated USING (public.can('staff.manage')) WITH CHECK (public.can('staff.manage'));
CREATE TRIGGER staff_profile_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_staff_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============ STUDENTS ============
CREATE SEQUENCE IF NOT EXISTS public.student_number_seq START 1;

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_no text NOT NULL UNIQUE,
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id uuid UNIQUE REFERENCES public.applications(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  nationality text,
  place_of_birth text,
  photo_url text,
  status public.student_status NOT NULL DEFAULT 'enrolled',
  admission_date date,
  previous_school text,
  current_class_id uuid,
  current_academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  exit_date date,
  exit_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX students_status_idx ON public.students(status);
CREATE INDEX students_class_idx ON public.students(current_class_id);
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.next_student_number()
RETURNS text LANGUAGE sql SET search_path = public AS $$
  SELECT 'SMP-STU-' || lpad(nextval('public.student_number_seq')::text, 6, '0');
$$;

-- ============ CLASSES ============
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  name text NOT NULL,
  stream text,
  class_teacher_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  room text,
  capacity integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage classes" ON public.classes FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.students
  ADD CONSTRAINT students_current_class_fkey FOREIGN KEY (current_class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- ============ GUARDIANS ============
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  occupation text,
  employer text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER guardians_updated_at BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_guardian_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.guardians WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE TABLE public.parent_student_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship public.guardian_relationship NOT NULL DEFAULT 'guardian',
  is_primary boolean NOT NULL DEFAULT false,
  is_emergency_contact boolean NOT NULL DEFAULT false,
  can_pickup boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_student_relationships TO authenticated;
GRANT ALL ON public.parent_student_relationships TO service_role;
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_guardian_of(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_student_relationships r
    JOIN public.guardians g ON g.id = r.guardian_id
    WHERE r.student_id = _student_id AND g.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_student_self(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.students s WHERE s.id = _student_id AND s.user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============ TEACHER ASSIGNMENTS ============
CREATE TABLE public.teacher_subject_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, subject_id, class_id, academic_year_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_subject_assignments TO authenticated;
GRANT ALL ON public.teacher_subject_assignments TO service_role;
ALTER TABLE public.teacher_subject_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read assignments" ON public.teacher_subject_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage assignments" ON public.teacher_subject_assignments FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));

CREATE OR REPLACE FUNCTION public.teaches_class(_class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_subject_assignments t
    JOIN public.staff s ON s.id = t.staff_id
    WHERE t.class_id = _class_id AND s.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.staff s ON s.id = c.class_teacher_id
    WHERE c.id = _class_id AND s.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.teaches_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students st
    WHERE st.id = _student_id AND st.current_class_id IS NOT NULL AND public.teaches_class(st.current_class_id)
  )
$$;

-- students / guardians / relationship policies (defined after helpers)
CREATE POLICY "Students readable by authorised users" ON public.students FOR SELECT TO authenticated
  USING (public.can('students.view') OR user_id = auth.uid() OR public.is_guardian_of(id) OR public.teaches_student(id));
CREATE POLICY "Create students" ON public.students FOR INSERT TO authenticated WITH CHECK (public.can('students.create'));
CREATE POLICY "Edit students" ON public.students FOR UPDATE TO authenticated USING (public.can('students.edit')) WITH CHECK (public.can('students.edit'));

CREATE POLICY "Guardians readable by authorised users" ON public.guardians FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can('parents.manage') OR public.can('students.view'));
CREATE POLICY "Guardian self update" ON public.guardians FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Manage guardians" ON public.guardians FOR ALL TO authenticated USING (public.can('parents.manage')) WITH CHECK (public.can('parents.manage'));

CREATE POLICY "Read own relationships" ON public.parent_student_relationships FOR SELECT TO authenticated
  USING (public.can('students.view') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Manage relationships" ON public.parent_student_relationships FOR ALL TO authenticated
  USING (public.can('parents.manage')) WITH CHECK (public.can('parents.manage'));

-- ============ ENROLLMENTS ============
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  stage public.enrollment_stage NOT NULL DEFAULT 'pending',
  start_date date,
  end_date date,
  reason text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX enrollments_student_idx ON public.enrollments(student_id);
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (public.can('enrollment.manage') OR public.can('students.view') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Manage enrollments" ON public.enrollments FOR ALL TO authenticated
  USING (public.can('enrollment.manage')) WITH CHECK (public.can('enrollment.manage'));
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TIMETABLE ============
CREATE TABLE public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
CREATE INDEX timetable_class_idx ON public.timetable_slots(class_id, day_of_week);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_slots TO authenticated;
GRANT ALL ON public.timetable_slots TO service_role;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read timetable" ON public.timetable_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage timetable" ON public.timetable_slots FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));
CREATE TRIGGER timetable_updated_at BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.check_timetable_conflict()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.timetable_slots t
    WHERE t.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND t.academic_year_id = NEW.academic_year_id
      AND t.day_of_week = NEW.day_of_week
      AND t.class_id = NEW.class_id
      AND NEW.start_time < t.end_time AND NEW.end_time > t.start_time
  ) THEN
    RAISE EXCEPTION 'This class already has a lesson scheduled in that time slot';
  END IF;
  IF NEW.staff_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.timetable_slots t
    WHERE t.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND t.academic_year_id = NEW.academic_year_id
      AND t.day_of_week = NEW.day_of_week
      AND t.staff_id = NEW.staff_id
      AND NEW.start_time < t.end_time AND NEW.end_time > t.start_time
  ) THEN
    RAISE EXCEPTION 'This teacher is already scheduled in that time slot';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER timetable_conflict_check BEFORE INSERT OR UPDATE ON public.timetable_slots
FOR EACH ROW EXECUTE FUNCTION public.check_timetable_conflict();