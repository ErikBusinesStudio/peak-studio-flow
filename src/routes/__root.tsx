import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthGate } from "@/components/app/AuthGate";
import { Shell } from "@/components/app/Shell";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="kicker justify-center">Fuori sentiero</p>
        <h1 className="title-xl mt-3">404</h1>
        <p className="mt-3 text-muted-foreground">Pagina non trovata.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground">Torna alla Home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="title-md">Qualcosa è andato storto</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="h-12 rounded-full bg-primary px-7 font-semibold text-primary-foreground">Riprova</button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a2048" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Peak Studio OS — Gestionale" },
      { name: "description", content: "Gestionale privato di Peak Studio: clienti, contatti, pagamenti e obiettivo 10.000 €." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        {() => (
          <Shell>
            <Outlet />
          </Shell>
        )}
      </AuthGate>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
