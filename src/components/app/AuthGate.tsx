import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/peak-logo.png.asset.json";

/** Sessione corrente: undefined = in caricamento, null = non autenticato. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}

export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const session = useSession();
  if (session === undefined) {
    return (
      <div className="app-bg flex items-center justify-center">
        <p className="hud text-muted-foreground">Caricamento…</p>
      </div>
    );
  }
  if (!session) return <LoginCard />;
  return <>{children(session)}</>;
}

function LoginCard() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "err", text: error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setMsg({ kind: "err", text: error.message });
      else if (!data.session) setMsg({ kind: "ok", text: "Account creato. Controlla la email per confermare, poi accedi." });
    }
    setBusy(false);
  }

  return (
    <div className="app-bg flex items-center justify-center px-5 py-10">
      <div className="surface w-full max-w-sm p-7">
        <img src={logoAsset.url} alt="Peak Studio" className="mb-5 h-11 w-auto" />
        <p className="kicker">Area privata</p>
        <h1 className="title-xl mt-3">Peak Studio OS</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {msg && <p className={msg.kind === "err" ? "text-sm text-destructive" : "text-sm text-emerald-800"}>{msg.text}</p>}
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
            {busy ? "Attendi…" : mode === "login" ? "Accedi" : "Crea account"}
          </Button>
        </form>
        <button type="button" className="mt-4 text-sm text-muted-foreground underline underline-offset-4" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
          {mode === "login" ? "Prima volta? Crea l'account" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}
