import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BellRing, Kanban, Wallet, LogOut, Mountain, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/peak-logo.png.asset.json";

const NAV = [
  { to: "/", label: "Home", icon: Mountain },
  { to: "/clienti", label: "Clienti", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/followup", label: "Follow-up", icon: BellRing },
  { to: "/finanze", label: "Finanze", icon: Wallet },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="app-bg pb-24 md:pb-0">
      <header className="app-header sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Peak Studio" className="h-9 w-auto" />
            <span className="hidden font-display text-lg font-extrabold uppercase tracking-tight sm:block">Peak Studio OS</span>
          </Link>
          <nav className="ml-6 hidden h-full items-stretch md:flex" aria-label="Principale">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} data-active={isActive(n.to)}
                className="nav-link-app hud flex items-center gap-2 px-4 text-[hsl(212_100%_96%)]/80 hover:text-white data-[active=true]:text-white">
                <n.icon className="size-4" />{n.label}
              </Link>
            ))}
          </nav>
          <button onClick={() => supabase.auth.signOut()} className="hud ml-auto flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10">
            <LogOut className="size-4" /><span className="hidden sm:inline">Esci</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>

      <nav className="app-header fixed inset-x-0 bottom-0 z-30 flex md:hidden" aria-label="Principale mobile">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} data-active={isActive(n.to)}
            className="hud flex flex-1 flex-col items-center gap-1 py-3 text-white/60 data-[active=true]:text-[hsl(191_100%_68%)]">
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
