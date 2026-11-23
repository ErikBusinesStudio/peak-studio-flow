CREATE TABLE public.app_owner (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_owner TO authenticated;
GRANT ALL ON public.app_owner TO service_role;
ALTER TABLE public.app_owner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads self" ON public.app_owner FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_app_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_owner WHERE user_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.is_app_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_owner() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_app_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.app_owner(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_app_owner() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_claim_owner AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.claim_app_owner();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','costs','diary_entries','events','incomes','managements','projects','savings','savings_targets','todos','updates'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public all" ON public.%I', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY "owner all" ON public.%I FOR ALL TO authenticated USING (public.is_app_owner()) WITH CHECK (public.is_app_owner())', t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS "public settings" ON public.settings;
REVOKE ALL ON public.settings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
CREATE POLICY "owner all" ON public.settings FOR ALL TO authenticated USING (public.is_app_owner()) WITH CHECK (public.is_app_owner());