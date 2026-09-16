CREATE OR REPLACE FUNCTION public.next_application_reference()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'CRA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_reference_seq')::text, 6, '0');
$$;