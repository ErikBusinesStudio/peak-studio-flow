import type { ReactNode } from "react";
import { P } from "@/lib/theme";

export function Sec({ title, accent = P.accent, action, children }: { title: string; accent?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 3, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
          <div className="display-font" style={{ fontSize: 14, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.14em", color: P.navy }}>
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
      style={{ padding: "9px 16px", borderRadius: 8, border: 0, background: color, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </button>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props;
  return <input {...rest} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, background: P.navyMid, color: P.navy, boxSizing: "border-box", outline: "none", ...style }} />;
}

export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { style, ...rest } = props;
  return <textarea {...rest} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, background: P.navyMid, color: P.navy, fontFamily: "inherit", boxSizing: "border-box", outline: "none", ...style }} />;
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 22, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="display-font" style={{ margin: 0, fontSize: 18, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: P.navy }}>{title}</h3>
          <button onClick={onClose} style={{ border: 0, background: "transparent", fontSize: 22, cursor: "pointer", color: P.slate }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16, color: P.navy, ...style }}>{children}</div>;
}
