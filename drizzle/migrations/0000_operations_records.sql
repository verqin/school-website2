CREATE TABLE public.operations_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'Active',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operations_records TO authenticated;
GRANT ALL ON public.operations_records TO service_role;
ALTER TABLE public.operations_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX operations_records_module_idx ON public.operations_records(module, created_at DESC);
CREATE POLICY "Staff read operations records" ON public.operations_records FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff add operations records" ON public.operations_records FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update operations records" ON public.operations_records FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete operations records" ON public.operations_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'administrator') OR public.has_role(auth.uid(),'principal'));
CREATE TRIGGER operations_records_updated BEFORE UPDATE ON public.operations_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();