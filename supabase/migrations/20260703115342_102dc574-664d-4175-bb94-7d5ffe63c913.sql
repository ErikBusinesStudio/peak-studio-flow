
-- Peak Studio OS schema (single-user, no auth)

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('acquisito','in_attesa','da_contattare','rifiutato')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('lead','proposta','trattativa','vinto','perso')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.managements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  monthly_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(10,2) NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta','media','bassa')),
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  mood INT,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  dashboard_name TEXT NOT NULL DEFAULT 'Peak Studio OS',
  primary_color TEXT NOT NULL DEFAULT '#6366f1',
  savings_goal NUMERIC(10,2) NOT NULL DEFAULT 10000,
  savings_deadline DATE,
  moto_split INT NOT NULL DEFAULT 50 CHECK (moto_split BETWEEN 0 AND 100)
);

-- Grants (no auth: allow anon full access for single-user personal app)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients, public.projects, public.managements, public.incomes, public.costs, public.savings, public.todos, public.events, public.diary_entries, public.settings TO anon, authenticated;
GRANT ALL ON public.clients, public.projects, public.managements, public.incomes, public.costs, public.savings, public.todos, public.events, public.diary_entries, public.settings TO service_role;

-- RLS: enable but allow all (single-user app, no login)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public all" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.managements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.savings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all" ON public.diary_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
