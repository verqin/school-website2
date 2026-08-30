-- ============ FINANCE ============
CREATE TABLE public.fee_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_categories TO authenticated;
GRANT ALL ON public.fee_categories TO service_role;
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read fee categories" ON public.fee_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage fee categories" ON public.fee_categories FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
CREATE TRIGGER fee_categories_updated_at BEFORE UPDATE ON public.fee_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structures TO authenticated;
GRANT ALL ON public.fee_structures TO service_role;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read fee structures" ON public.fee_structures FOR SELECT TO authenticated USING (public.can('finance.view') OR public.can('finance.manage'));
CREATE POLICY "Manage fee structures" ON public.fee_structures FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
CREATE TRIGGER fee_structures_updated_at BEFORE UPDATE ON public.fee_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fee_structure_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id uuid NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  fee_category_id uuid NOT NULL REFERENCES public.fee_categories(id) ON DELETE RESTRICT,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structure_items TO authenticated;
GRANT ALL ON public.fee_structure_items TO service_role;
ALTER TABLE public.fee_structure_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read fee structure items" ON public.fee_structure_items FOR SELECT TO authenticated USING (public.can('finance.view') OR public.can('finance.manage'));
CREATE POLICY "Manage fee structure items" ON public.fee_structure_items FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START 1;

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text NOT NULL UNIQUE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'USD',
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  paid_cents integer NOT NULL DEFAULT 0 CHECK (paid_cents >= 0),
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invoices_student_idx ON public.invoices(student_id);
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read invoices" ON public.invoices FOR SELECT TO authenticated
  USING (public.can('finance.view') OR public.can('finance.manage') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  fee_category_id uuid REFERENCES public.fee_categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(8,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount_cents integer NOT NULL CHECK (unit_amount_cents >= 0),
  discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read invoice items" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id
    AND (public.can('finance.view') OR public.can('finance.manage') OR public.is_guardian_of(i.student_id) OR public.is_student_self(i.student_id))));
CREATE POLICY "Manage invoice items" ON public.invoice_items FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));

CREATE TABLE public.student_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  fee_category_id uuid REFERENCES public.fee_categories(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.student_charges TO authenticated;
GRANT ALL ON public.student_charges TO service_role;
ALTER TABLE public.student_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read student charges" ON public.student_charges FOR SELECT TO authenticated
  USING (public.can('finance.view') OR public.can('finance.manage') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Manage student charges" ON public.student_charges FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
CREATE TRIGGER student_charges_updated_at BEFORE UPDATE ON public.student_charges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  requires_reference boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage payment methods" ON public.payment_methods FOR ALL TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
INSERT INTO public.payment_methods (name, requires_reference) VALUES
  ('Cash', false), ('Bank Transfer', true), ('Card', true), ('Online Payment', true), ('Other', false)
ON CONFLICT DO NOTHING;

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'USD',
  payment_date date NOT NULL DEFAULT current_date,
  payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  provider text,
  transaction_reference text,
  verified boolean NOT NULL DEFAULT false,
  received_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, transaction_reference)
);
CREATE INDEX payments_student_idx ON public.payments(student_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read payments" ON public.payments FOR SELECT TO authenticated
  USING (public.can('finance.view') OR public.can('finance.manage') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Record payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.can('payments.record'));
CREATE POLICY "Adjust payments" ON public.payments FOR UPDATE TO authenticated USING (public.can('finance.manage')) WITH CHECK (public.can('finance.manage'));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text NOT NULL UNIQUE,
  payment_id uuid NOT NULL UNIQUE REFERENCES public.payments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read receipts" ON public.receipts FOR SELECT TO authenticated
  USING (public.can('finance.view') OR public.can('finance.manage') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Issue receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (public.can('payments.record'));

CREATE TABLE public.finance_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field text NOT NULL,
  old_value text,
  new_value text,
  reason text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.finance_adjustments TO authenticated;
GRANT ALL ON public.finance_adjustments TO service_role;
ALTER TABLE public.finance_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read finance adjustments" ON public.finance_adjustments FOR SELECT TO authenticated USING (public.can('finance.view') OR public.can('finance.manage'));
CREATE POLICY "Log finance adjustments" ON public.finance_adjustments FOR INSERT TO authenticated WITH CHECK (public.can('finance.manage'));

-- ============ ANNOUNCEMENTS / NOTIFICATIONS / CALENDAR ============
CREATE TABLE public.school_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience public.audience_scope NOT NULL DEFAULT 'everyone',
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT 'normal',
  attachment_url text,
  publish_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_announcements TO authenticated;
GRANT ALL ON public.school_announcements TO service_role;
ALTER TABLE public.school_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read announcements" ON public.school_announcements FOR SELECT TO authenticated
  USING (public.can('announcements.manage') OR (is_published AND publish_at <= now() AND (expires_at IS NULL OR expires_at > now())));
CREATE POLICY "Manage announcements" ON public.school_announcements FOR ALL TO authenticated USING (public.can('announcements.manage')) WITH CHECK (public.can('announcements.manage'));
CREATE TRIGGER school_announcements_updated_at BEFORE UPDATE ON public.school_announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  category text NOT NULL DEFAULT 'general',
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX user_notifications_user_idx ON public.user_notifications(user_id, is_read);
GRANT SELECT, INSERT, UPDATE ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own notifications" ON public.user_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON public.user_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Send notifications" ON public.user_notifications FOR INSERT TO authenticated WITH CHECK (public.can('announcements.manage'));

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  audience public.audience_scope NOT NULL DEFAULT 'staff',
  grade_level_id uuid REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  public_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read calendar" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage calendar" ON public.calendar_events FOR ALL TO authenticated USING (public.can('announcements.manage')) WITH CHECK (public.can('announcements.manage'));
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOCUMENTS ============
CREATE TABLE public.school_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes integer,
  audience public.audience_scope NOT NULL DEFAULT 'staff',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_documents TO authenticated;
GRANT ALL ON public.school_documents TO service_role;
ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read school documents" ON public.school_documents FOR SELECT TO authenticated
  USING (public.can('documents.manage')
         OR (audience = 'everyone')
         OR (audience = 'parents' AND public.current_guardian_id() IS NOT NULL)
         OR (audience = 'students' AND public.current_student_id() IS NOT NULL)
         OR (audience IN ('teachers','staff') AND public.current_staff_id() IS NOT NULL));
CREATE POLICY "Manage school documents" ON public.school_documents FOR ALL TO authenticated USING (public.can('documents.manage')) WITH CHECK (public.can('documents.manage'));
CREATE TRIGGER school_documents_updated_at BEFORE UPDATE ON public.school_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  title text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes integer,
  visible_to_guardians boolean NOT NULL DEFAULT false,
  visible_to_student boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_documents TO authenticated;
GRANT ALL ON public.student_documents TO service_role;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read student documents" ON public.student_documents FOR SELECT TO authenticated
  USING (public.can('students.view')
         OR (visible_to_guardians AND public.is_guardian_of(student_id))
         OR (visible_to_student AND public.is_student_self(student_id)));
CREATE POLICY "Manage student documents" ON public.student_documents FOR ALL TO authenticated USING (public.can('students.edit')) WITH CHECK (public.can('students.edit'));
CREATE TRIGGER student_documents_updated_at BEFORE UPDATE ON public.student_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DISCIPLINE / ACTIVITIES ============
CREATE TABLE public.discipline_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  incident_date date NOT NULL DEFAULT current_date,
  category text NOT NULL,
  description text NOT NULL,
  action_taken text,
  status public.discipline_status NOT NULL DEFAULT 'open',
  visible_to_guardians boolean NOT NULL DEFAULT false,
  internal_notes text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.discipline_records TO authenticated;
GRANT ALL ON public.discipline_records TO service_role;
ALTER TABLE public.discipline_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read discipline records" ON public.discipline_records FOR SELECT TO authenticated
  USING (public.can('discipline.manage') OR (visible_to_guardians AND public.is_guardian_of(student_id)));
CREATE POLICY "Manage discipline records" ON public.discipline_records FOR ALL TO authenticated USING (public.can('discipline.manage')) WITH CHECK (public.can('discipline.manage'));
CREATE TRIGGER discipline_updated_at BEFORE UPDATE ON public.discipline_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'club',
  description text,
  coordinator_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage activities" ON public.activities FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.student_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  role text,
  joined_on date NOT NULL DEFAULT current_date,
  left_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, activity_id, joined_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_activities TO authenticated;
GRANT ALL ON public.student_activities TO service_role;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read student activities" ON public.student_activities FOR SELECT TO authenticated
  USING (public.can('students.view') OR public.is_guardian_of(student_id) OR public.is_student_self(student_id));
CREATE POLICY "Manage student activities" ON public.student_activities FOR ALL TO authenticated USING (public.can('academics.manage')) WITH CHECK (public.can('academics.manage'));

-- ============ LIBRARY ============
CREATE TABLE public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  isbn text UNIQUE,
  category text,
  description text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_books TO authenticated;
GRANT ALL ON public.library_books TO service_role;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read library books" ON public.library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage library books" ON public.library_books FOR ALL TO authenticated USING (public.can('library.manage')) WITH CHECK (public.can('library.manage'));
CREATE TRIGGER library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.library_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  copy_code text NOT NULL UNIQUE,
  condition text NOT NULL DEFAULT 'good',
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_copies TO authenticated;
GRANT ALL ON public.library_copies TO service_role;
ALTER TABLE public.library_copies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read library copies" ON public.library_copies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage library copies" ON public.library_copies FOR ALL TO authenticated USING (public.can('library.manage')) WITH CHECK (public.can('library.manage'));

CREATE TABLE public.library_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.library_copies(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  borrowed_on date NOT NULL DEFAULT current_date,
  due_on date NOT NULL,
  returned_on date,
  status public.loan_status NOT NULL DEFAULT 'borrowed',
  issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.library_loans TO authenticated;
GRANT ALL ON public.library_loans TO service_role;
ALTER TABLE public.library_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read library loans" ON public.library_loans FOR SELECT TO authenticated
  USING (public.can('library.manage') OR public.is_student_self(student_id) OR public.is_guardian_of(student_id));
CREATE POLICY "Manage library loans" ON public.library_loans FOR ALL TO authenticated USING (public.can('library.manage')) WITH CHECK (public.can('library.manage'));
CREATE TRIGGER library_loans_updated_at BEFORE UPDATE ON public.library_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUDIT ============
CREATE TABLE public.activity_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_audit_entity_idx ON public.activity_audit_log(entity_type, entity_id);
GRANT SELECT, INSERT ON public.activity_audit_log TO authenticated;
GRANT ALL ON public.activity_audit_log TO service_role;
ALTER TABLE public.activity_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read audit log" ON public.activity_audit_log FOR SELECT TO authenticated USING (public.can('settings.manage') OR public.can('students.view'));
CREATE POLICY "Write audit log" ON public.activity_audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);