import type { ReactNode } from "react";
import { P } from "@/lib/theme";

export function Sec({ title, accent = P.accent, action, children }: { title: string; accent?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: P.slate }}>
            {title}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Btn({ color = P.accent, onClick, children, disabled, type = "button", style }: { color?: string; onClick?: () => void; children: ReactNode; disabled?: boolean; type?: "button" | "submit"; style?: React.CSSProperties }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ padding: "10px 18px", borderRadius: 8, border: 0, background: color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </button>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props;
  return <input {...rest} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, background: "#fff", boxSizing: "border-box", ...style }} />;
}

export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { style, ...rest } = props;
  return <textarea {...rest} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", boxSizing: "border-box", ...style }} />;
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#0008", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 24, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: P.navy }}>{title}</h3>
          <button onClick={onClose} style={{ border: 0, background: "transparent", fontSize: 20, cursor: "pointer", color: P.slate }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>;
}
