-- Lock helper functions away from anonymous callers
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_guardian_of(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_student_self(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_student_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_guardian_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_staff_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.teaches_class(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.teaches_student(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.next_student_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_application_reference() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_application_status(uuid, public.application_status, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.submit_application(uuid) FROM anon;

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  attendance_date date NOT NULL,
  session_label text NOT NULL DEFAULT 'day',
  status public.attendance_status NOT NULL,
  reason text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date, session_label)
);
CREATE INDEX attendance_class_date_idx ON public.attendance_records(class_id, attendance_date);
CREATE INDEX attendance_student_date_idx ON public.attendance_records(student_id, attendance_date);
GRANT SELECT, INSERT, UPDATE ON public.attendance_records TO authenticated;
GRANT ALL ON public.attendance_records TO service_role;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read attendance" ON public.attendance_records FOR SELECT TO authenticated
  USING (public.can('attendance.view') OR public.can('attendance.manage') OR public.teaches_class(class_id)
         OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Record attendance" ON public.attendance_records FOR INSERT TO authenticated
  WITH CHECK (public.can('attendance.manage') AND (public.teaches_class(class_id) OR public.can('students.edit')));
CREATE POLICY "Update attendance" ON public.attendance_records FOR UPDATE TO authenticated
  USING (public.can('attendance.manage') AND (public.teaches_class(class_id) OR public.can('students.edit')))
  WITH CHECK (public.can('attendance.manage'));
CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ GRADING SCALES ============
CREATE TABLE public.grading_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grading_scales TO authenticated;
GRANT ALL ON public.grading_scales TO service_role;
ALTER TABLE public.grading_scales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read grading scales" ON public.grading_scales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage grading scales" ON public.grading_scales FOR ALL TO authenticated USING (public.can('settings.manage')) WITH CHECK (public.can('settings.manage'));
CREATE TRIGGER grading_scales_updated_at BEFORE UPDATE ON public.grading_scales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grading_bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id uuid NOT NULL REFERENCES public.grading_scales(id) ON DELETE CASCADE,
  label text NOT NULL,
  min_percentage numeric(5,2) NOT NULL CHECK (min_percentage >= 0),
  max_percentage numeric(5,2) NOT NULL CHECK (max_percentage <= 100),
  description text,
  points numeric(5,2),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (max_percentage >= min_percentage)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grading_bands TO authenticated;
GRANT ALL ON public.grading_bands TO service_role;
ALTER TABLE public.grading_bands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can read grading bands" ON public.grading_bands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage grading bands" ON public.grading_bands FOR ALL TO authenticated USING (public.can('settings.manage')) WITH CHECK (public.can('settings.manage'));

CREATE OR REPLACE FUNCTION public.grade_for_percentage(_percentage numeric, _scale_id uuid DEFAULT NULL)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.label FROM public.grading_bands b
  JOIN public.grading_scales s ON s.id = b.scale_id
  WHERE (_scale_id IS NOT NULL AND b.scale_id = _scale_id) OR (_scale_id IS NULL AND s.is_default)
    AND _percentage BETWEEN b.min_percentage AND b.max_percentage
  ORDER BY b.min_percentage DESC LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.grade_for_percentage(numeric, uuid) FROM anon;

-- ============ ASSESSMENTS ============
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  assessment_type public.assessment_type NOT NULL DEFAULT 'test',
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  assessment_date date,
  max_mark numeric(6,2) NOT NULL CHECK (max_mark > 0),
  weight numeric(5,2) NOT NULL DEFAULT 1 CHECK (weight >= 0),
  state public.publication_state NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read assessments" ON public.assessments FOR SELECT TO authenticated
  USING (public.can('academics.view') OR public.teaches_class(class_id)
         OR (state = 'published' AND EXISTS (SELECT 1 FROM public.students s WHERE s.current_class_id = assessments.class_id AND (public.is_student_self(s.id) OR public.is_guardian_of(s.id)))));
CREATE POLICY "Manage assessments" ON public.assessments FOR ALL TO authenticated
  USING (public.can('academics.manage') OR (public.can('grades.enter') AND public.teaches_class(class_id)))
  WITH CHECK (public.can('academics.manage') OR (public.can('grades.enter') AND public.teaches_class(class_id)));
CREATE TRIGGER assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  mark numeric(6,2),
  comment text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read assessment results" ON public.assessment_results FOR SELECT TO authenticated
  USING (public.can('academics.view') OR public.teaches_student(student_id)
         OR ((public.is_student_self(student_id) OR public.is_guardian_of(student_id))
             AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.state = 'published')));
CREATE POLICY "Enter assessment results" ON public.assessment_results FOR ALL TO authenticated
  USING (public.can('academics.manage') OR (public.can('grades.enter') AND public.teaches_student(student_id)))
  WITH CHECK (public.can('academics.manage') OR (public.can('grades.enter') AND public.teaches_student(student_id)));
CREATE TRIGGER assessment_results_updated_at BEFORE UPDATE ON public.assessment_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_assessment_mark()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE max_allowed numeric;
BEGIN
  IF NEW.mark IS NULL THEN RETURN NEW; END IF;
  SELECT max_mark INTO max_allowed FROM public.assessments WHERE id = NEW.assessment_id;
  IF NEW.mark < 0 THEN RAISE EXCEPTION 'A mark cannot be negative'; END IF;
  IF NEW.mark > max_allowed THEN RAISE EXCEPTION 'A mark cannot exceed the maximum of %', max_allowed; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER assessment_result_validation BEFORE INSERT OR UPDATE ON public.assessment_results
FOR EACH ROW EXECUTE FUNCTION public.validate_assessment_mark();

-- ============ EXAMINATIONS ============
CREATE TABLE public.examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  starts_on date,
  ends_on date,
  state public.publication_state NOT NULL DEFAULT 'draft',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.examinations TO authenticated;
GRANT ALL ON public.examinations TO service_role;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read examinations" ON public.examinations FOR SELECT TO authenticated
  USING (public.can('academics.view') OR public.can('examinations.manage') OR state = 'published');
CREATE POLICY "Manage examinations" ON public.examinations FOR ALL TO authenticated
  USING (public.can('examinations.manage')) WITH CHECK (public.can('examinations.manage'));
CREATE TRIGGER examinations_updated_at BEFORE UPDATE ON public.examinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.examination_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid NOT NULL REFERENCES public.examinations(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  paper_date date,
  start_time time,
  end_time time,
  room text,
  invigilator_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  max_mark numeric(6,2) NOT NULL DEFAULT 100 CHECK (max_mark > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.examination_papers TO authenticated;
GRANT ALL ON public.examination_papers TO service_role;
ALTER TABLE public.examination_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read exam papers" ON public.examination_papers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage exam papers" ON public.examination_papers FOR ALL TO authenticated
  USING (public.can('examinations.manage')) WITH CHECK (public.can('examinations.manage'));
CREATE TRIGGER exam_papers_updated_at BEFORE UPDATE ON public.examination_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.examination_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES public.examination_papers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  mark numeric(6,2),
  grade_label text,
  comment text,
  state public.publication_state NOT NULL DEFAULT 'draft',
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (paper_id, student_id)
);
GRANT SELECT, INSERT, UPDATE ON public.examination_results TO authenticated;
GRANT ALL ON public.examination_results TO service_role;
ALTER TABLE public.examination_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read exam results" ON public.examination_results FOR SELECT TO authenticated
  USING (public.can('academics.view') OR public.can('examinations.manage') OR public.teaches_student(student_id)
         OR ((public.is_student_self(student_id) OR public.is_guardian_of(student_id)) AND state = 'published'));
CREATE POLICY "Enter exam results" ON public.examination_results FOR ALL TO authenticated
  USING (public.can('examinations.manage') OR (public.can('grades.enter') AND public.teaches_student(student_id)))
  WITH CHECK (public.can('examinations.manage') OR (public.can('grades.enter') AND public.teaches_student(student_id) AND state <> 'published'));
CREATE TRIGGER exam_results_updated_at BEFORE UPDATE ON public.examination_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_exam_mark()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE max_allowed numeric;
BEGIN
  IF NEW.mark IS NULL THEN RETURN NEW; END IF;
  SELECT max_mark INTO max_allowed FROM public.examination_papers WHERE id = NEW.paper_id;
  IF NEW.mark < 0 THEN RAISE EXCEPTION 'A mark cannot be negative'; END IF;
  IF NEW.mark > max_allowed THEN RAISE EXCEPTION 'A mark cannot exceed the maximum of %', max_allowed; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER exam_result_validation BEFORE INSERT OR UPDATE ON public.examination_results
FOR EACH ROW EXECUTE FUNCTION public.validate_exam_mark();

-- ============ REPORT CARDS ============
CREATE TABLE public.report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  state public.publication_state NOT NULL DEFAULT 'draft',
  overall_percentage numeric(5,2),
  overall_grade text,
  class_teacher_comment text,
  principal_comment text,
  attendance_present integer,
  attendance_total integer,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year_id, term_id)
);
GRANT SELECT, INSERT, UPDATE ON public.report_cards TO authenticated;
GRANT ALL ON public.report_cards TO service_role;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read report cards" ON public.report_cards FOR SELECT TO authenticated
  USING (public.can('academics.view') OR public.can('reports.publish') OR public.teaches_student(student_id)
         OR ((public.is_student_self(student_id) OR public.is_guardian_of(student_id)) AND state = 'published'));
CREATE POLICY "Work on report cards" ON public.report_cards FOR ALL TO authenticated
  USING (public.can('reports.publish') OR public.can('grades.approve') OR (public.can('grades.enter') AND public.teaches_student(student_id)))
  WITH CHECK (public.can('reports.publish') OR public.can('grades.approve') OR (public.can('grades.enter') AND public.teaches_student(student_id) AND state IN ('draft','submitted')));
CREATE TRIGGER report_cards_updated_at BEFORE UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.report_card_subject_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_card_id uuid NOT NULL REFERENCES public.report_cards(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  mark numeric(6,2),
  max_mark numeric(6,2) NOT NULL DEFAULT 100,
  percentage numeric(5,2),
  grade_label text,
  teacher_comment text,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_card_id, subject_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_card_subject_results TO authenticated;
GRANT ALL ON public.report_card_subject_results TO service_role;
ALTER TABLE public.report_card_subject_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read report card lines" ON public.report_card_subject_results FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.report_cards rc WHERE rc.id = report_card_id
    AND (public.can('academics.view') OR public.can('reports.publish') OR public.teaches_student(rc.student_id)
         OR ((public.is_student_self(rc.student_id) OR public.is_guardian_of(rc.student_id)) AND rc.state = 'published'))));
CREATE POLICY "Write report card lines" ON public.report_card_subject_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.report_cards rc WHERE rc.id = report_card_id
    AND (public.can('reports.publish') OR public.can('grades.approve') OR (public.can('grades.enter') AND public.teaches_student(rc.student_id)))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.report_cards rc WHERE rc.id = report_card_id
    AND rc.state IN ('draft','submitted','reviewed')
    AND (public.can('reports.publish') OR public.can('grades.approve') OR (public.can('grades.enter') AND public.teaches_student(rc.student_id)))));
CREATE TRIGGER report_card_lines_updated_at BEFORE UPDATE ON public.report_card_subject_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();