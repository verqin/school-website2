CREATE OR REPLACE FUNCTION public.claim_portal_links()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  _g int := 0;
  _s int := 0;
BEGIN
  IF _uid IS NULL OR _email = '' THEN
    RETURN json_build_object('guardians', 0, 'staff', 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guardians WHERE user_id = _uid) THEN
    UPDATE public.guardians SET user_id = _uid, updated_at = now()
    WHERE id = (SELECT id FROM public.guardians WHERE user_id IS NULL AND lower(email) = _email ORDER BY created_at LIMIT 1);
    GET DIAGNOSTICS _g = ROW_COUNT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.staff WHERE user_id = _uid) THEN
    UPDATE public.staff SET user_id = _uid, updated_at = now()
    WHERE id = (SELECT id FROM public.staff WHERE user_id IS NULL AND lower(email) = _email ORDER BY created_at LIMIT 1);
    GET DIAGNOSTICS _s = ROW_COUNT;
  END IF;
  -- Staff records that the school has given teaching work get the teacher role
  IF EXISTS (
    SELECT 1 FROM public.staff st WHERE st.user_id = _uid AND st.is_active AND (
      EXISTS (SELECT 1 FROM public.teacher_subject_assignments t WHERE t.staff_id = st.id)
      OR EXISTS (SELECT 1 FROM public.classes c WHERE c.class_teacher_id = st.id))
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'teacher') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN json_build_object('guardians', _g, 'staff', _s);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_portal_links() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_portal_links() TO authenticated;