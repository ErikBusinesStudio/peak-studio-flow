import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { statoCfg, type Stato } from "@/lib/gestionale";

export function StatoBadge({ stato, className }: { stato: Stato; className?: string }) {
  const c = statoCfg(stato);
  return (
    <span className={cn("hud inline-flex items-center rounded-full border px-2.5 py-1 text-[10px]", c.cls, className)}>
      {c.short}
    </span>
  );
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker">{kicker}</p>
        <h1 className="title-xl mt-3">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "light" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "light" | "deep" }) {
  return (
    <div className={cn("p-5", tone === "deep" ? "surface-deep" : "surface")}>
      <p className={cn("hud", tone === "deep" ? "text-white/70" : "text-muted-foreground")}>{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold leading-none tracking-tight md:text-4xl">{value}</p>
      {hint && <p className={cn("mt-2 text-sm", tone === "deep" ? "text-white/70" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
