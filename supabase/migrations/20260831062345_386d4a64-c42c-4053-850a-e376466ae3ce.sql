-- Invoice numbering + totals
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.invoice_no IS NULL OR NEW.invoice_no = '' THEN
    NEW.invoice_no := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER invoices_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.receipt_no IS NULL OR NEW.receipt_no = '' THEN
    NEW.receipt_no := 'RCT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.receipt_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER receipts_number BEFORE INSERT ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.set_receipt_number();

CREATE OR REPLACE FUNCTION public.recalculate_invoice(_invoice_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sub integer; disc integer; paid integer; inv public.invoices;
BEGIN
  SELECT * INTO inv FROM public.invoices WHERE id = _invoice_id;
  IF inv.id IS NULL THEN RETURN; END IF;
  SELECT coalesce(sum(round(unit_amount_cents * quantity))::int, 0), coalesce(sum(discount_cents), 0)
    INTO sub, disc FROM public.invoice_items WHERE invoice_id = _invoice_id;
  SELECT coalesce(sum(amount_cents), 0) INTO paid FROM public.payments WHERE invoice_id = _invoice_id;
  UPDATE public.invoices SET
    subtotal_cents = sub,
    discount_cents = disc,
    total_cents = greatest(sub - disc, 0),
    paid_cents = paid,
    status = CASE
      WHEN status IN ('draft','cancelled') THEN status
      WHEN paid >= greatest(sub - disc, 0) AND greatest(sub - disc, 0) > 0 THEN 'paid'::public.invoice_status
      WHEN paid > 0 THEN 'partially_paid'::public.invoice_status
      WHEN due_date IS NOT NULL AND due_date < current_date THEN 'overdue'::public.invoice_status
      ELSE 'issued'::public.invoice_status END,
    updated_at = now()
  WHERE id = _invoice_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.recalculate_invoice(uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.invoice_items_recalc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalculate_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER invoice_items_recalc_trg AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.invoice_items_recalc();

CREATE OR REPLACE FUNCTION public.payments_recalc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF COALESCE(NEW.invoice_id, OLD.invoice_id) IS NOT NULL THEN
    PERFORM public.recalculate_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER payments_recalc_trg AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.payments_recalc();

-- ============ ENROLLMENT CONVERSION ============
CREATE OR REPLACE FUNCTION public.enroll_accepted_applicant(
  _application_id uuid,
  _academic_year_id uuid,
  _grade_level_id uuid DEFAULT NULL,
  _class_id uuid DEFAULT NULL
) RETURNS public.students
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  app public.applications;
  student public.students;
  guardian public.guardians;
  new_no text;
BEGIN
  IF NOT public.has_permission(auth.uid(), 'enrollment.manage') THEN
    RAISE EXCEPTION 'Not authorised to enrol students';
  END IF;

  SELECT * INTO app FROM public.applications WHERE id = _application_id FOR UPDATE;
  IF app.id IS NULL THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF app.status <> 'accepted' THEN RAISE EXCEPTION 'Only accepted applications can be enrolled'; END IF;

  SELECT * INTO student FROM public.students WHERE application_id = app.id;

  IF student.id IS NULL THEN
    new_no := public.next_student_number();
    INSERT INTO public.students (
      student_no, application_id, first_name, last_name, date_of_birth,
      status, admission_date, grade_level_id, current_academic_year_id, current_class_id
    ) VALUES (
      new_no, app.id, coalesce(app.student_first_name, 'Unknown'), coalesce(app.student_last_name, 'Unknown'),
      app.student_dob, 'enrolled', current_date,
      coalesce(_grade_level_id, app.grade_level_id), _academic_year_id, _class_id
    ) RETURNING * INTO student;
  ELSE
    UPDATE public.students SET
      current_academic_year_id = coalesce(_academic_year_id, current_academic_year_id),
      grade_level_id = coalesce(_grade_level_id, grade_level_id),
      current_class_id = coalesce(_class_id, current_class_id),
      updated_at = now()
    WHERE id = student.id RETURNING * INTO student;
  END IF;

  IF coalesce(app.guardian_email, '') <> '' THEN
    SELECT * INTO guardian FROM public.guardians WHERE lower(email) = lower(app.guardian_email) LIMIT 1;
    IF guardian.id IS NULL THEN
      INSERT INTO public.guardians (user_id, full_name, email, phone)
      VALUES (app.applicant_user_id, coalesce(app.guardian_name, app.guardian_email), app.guardian_email, app.guardian_phone)
      ON CONFLICT (user_id) DO UPDATE SET email = excluded.email
      RETURNING * INTO guardian;
    END IF;
    IF guardian.id IS NOT NULL THEN
      INSERT INTO public.parent_student_relationships (guardian_id, student_id, relationship, is_primary, is_emergency_contact)
      VALUES (guardian.id, student.id, 'guardian', true, true)
      ON CONFLICT (guardian_id, student_id) DO NOTHING;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.enrollments e WHERE e.student_id = student.id AND e.academic_year_id = _academic_year_id) THEN
    INSERT INTO public.enrollments (student_id, application_id, academic_year_id, grade_level_id, class_id, stage, start_date, created_by)
    VALUES (student.id, app.id, _academic_year_id, coalesce(_grade_level_id, app.grade_level_id), _class_id, 'pending', current_date, auth.uid());
  END IF;

  INSERT INTO public.applicant_notifications (user_id, application_id, title, body, link_url)
  VALUES (app.applicant_user_id, app.id, 'Enrolment started',
          'Enrolment has started for ' || student.first_name || ' ' || student.last_name || ' (Student ID ' || student.student_no || ').',
          '/parent');

  INSERT INTO public.activity_audit_log (entity_type, entity_id, action, detail, actor_id)
  VALUES ('student', student.id, 'student.enrolled_from_application',
          jsonb_build_object('application_id', app.id, 'student_no', student.student_no), auth.uid());

  RETURN student;
END; $$;
REVOKE EXECUTE ON FUNCTION public.enroll_accepted_applicant(uuid, uuid, uuid, uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.set_enrollment_stage(_enrollment_id uuid, _stage public.enrollment_stage, _note text DEFAULT NULL)
RETURNS public.enrollments LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.enrollments;
BEGIN
  IF NOT public.has_permission(auth.uid(), 'enrollment.manage') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  UPDATE public.enrollments SET stage = _stage, notes = coalesce(_note, notes), updated_at = now()
  WHERE id = _enrollment_id RETURNING * INTO e;
  IF e.id IS NULL THEN RAISE EXCEPTION 'Enrolment not found'; END IF;

  IF _stage = 'active' THEN
    UPDATE public.students SET status = 'active', current_class_id = coalesce(e.class_id, current_class_id), updated_at = now()
    WHERE id = e.student_id;
  ELSIF _stage = 'confirmed' THEN
    UPDATE public.students SET status = 'enrolled', updated_at = now() WHERE id = e.student_id;
  END IF;

  INSERT INTO public.activity_audit_log (entity_type, entity_id, action, detail, actor_id)
  VALUES ('enrollment', e.id, 'enrollment.stage_changed', jsonb_build_object('stage', _stage, 'note', _note), auth.uid());
  RETURN e;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_enrollment_stage(uuid, public.enrollment_stage, text) FROM anon;

-- ============ DEFAULT CONFIGURATION ============
INSERT INTO public.grading_scales (name, description, is_default)
VALUES ('Default percentage scale', 'Editable default grading scale - adjust the bands in Settings.', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.grading_bands (scale_id, label, min_percentage, max_percentage, description, points, sort_order)
SELECT s.id, b.label, b.mn, b.mx, b.descr, b.pts, b.ord
FROM public.grading_scales s
CROSS JOIN (VALUES
  ('A', 80, 100, 'Excellent', 4, 1),
  ('B', 70, 79.99, 'Very good', 3, 2),
  ('C', 60, 69.99, 'Good', 2, 3),
  ('D', 50, 59.99, 'Satisfactory', 1, 4),
  ('E', 40, 49.99, 'Needs improvement', 0.5, 5),
  ('F', 0, 39.99, 'Fail', 0, 6)
) AS b(label, mn, mx, descr, pts, ord)
WHERE s.is_default;

INSERT INTO public.fee_categories (name, code, description) VALUES
  ('Tuition', 'TUITION', 'Core tuition fee'),
  ('Registration', 'REGISTRATION', 'One-off registration fee'),
  ('Development levy', 'DEVELOPMENT', 'School development levy'),
  ('Activities', 'ACTIVITIES', 'Clubs, sports and cultural activities'),
  ('Examination', 'EXAM', 'Examination fees')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.academic_years (name, starts_on, ends_on, is_active)
VALUES (to_char(now(), 'YYYY'), date_trunc('year', now())::date, (date_trunc('year', now()) + interval '1 year - 1 day')::date, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.terms (academic_year_id, name, starts_on, ends_on, is_active, sort_order)
SELECT y.id,
       t.name,
       make_date(extract(year from y.starts_on)::int, t.sm, 1),
       (make_date(extract(year from y.starts_on)::int, t.em, 1) + interval '1 month - 1 day')::date,
       t.act,
       t.ord
FROM public.academic_years y
CROSS JOIN (VALUES
  ('Term 1', 1, 4, true, 1),
  ('Term 2', 5, 8, false, 2),
  ('Term 3', 9, 12, false, 3)
) AS t(name, sm, em, act, ord)
WHERE y.is_active
ON CONFLICT (academic_year_id, name) DO NOTHING;