GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_targets TO anon, authenticated;
GRANT ALL ON public.savings_targets TO service_role;
ALTER TABLE public.savings_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all" ON public.savings_targets FOR ALL USING (true) WITH CHECK (true);