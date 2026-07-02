"use client";

import { theme } from "@/lib/theme";
import { BarChart2, MessageCircle } from "lucide-react";

// ─── Logo SVG mark ────────────────────────────────────────
export function LogoMark({ size = 20 }) {
  return (
    <svg width={size * 0.55} height={size * 0.65} viewBox="0 0 22 28" fill="none">
      <circle cx="18" cy="4"  r="3.5" fill={theme.accent} />
      <circle cx="11" cy="14" r="2.5" fill={theme.accent} opacity="0.55" />
      <circle cx="18" cy="24" r="3.5" fill={theme.accent} />
      <line x1="18" y1="4"  x2="11" y2="14" stroke={theme.accent} strokeWidth="1.5" opacity="0.45" />
      <line x1="11" y1="14" x2="18" y2="24" stroke={theme.accent} strokeWidth="1.5" opacity="0.45" />
      <circle cx="4" cy="9"  r="2" fill={theme.accent} opacity="0.3" />
      <circle cx="4" cy="19" r="2" fill={theme.accent} opacity="0.3" />
      <line x1="11" y1="14" x2="4" y2="9"  stroke={theme.accent} strokeWidth="1" opacity="0.25" />
      <line x1="11" y1="14" x2="4" y2="19" stroke={theme.accent} strokeWidth="1" opacity="0.25" />
    </svg>
  );
}

// ─── Tag/badge ────────────────────────────────────────────
export function Tag({ children, hot }) {
  return (
    <span style={{
      background: hot ? theme.redDim : theme.accentDim,
      color: hot ? theme.red : theme.accentBright,
      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
      fontFamily: "Inter, sans-serif", letterSpacing: "0.05em", whiteSpace: "nowrap",
      border: hot ? `1px solid ${theme.redBorder}` : "none",
    }}>
      {hot && <span style={{ marginRight: 4 }}>🔴</span>}{children}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: theme.accentDim, border: `1px solid ${theme.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        {icon}
      </div>
      <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{title}</p>
      <p style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6, maxWidth: 240 }}>{subtitle}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Skeleton loading card ────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ background: theme.surface, borderRadius: 14, padding: "14px", marginBottom: 10, border: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.border, animation: "shimmer 1.4s infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, width: "40%", background: theme.border, borderRadius: 4, marginBottom: 5, animation: "shimmer 1.4s infinite" }} />
          <div style={{ height: 8, width: "25%", background: theme.border, borderRadius: 4, animation: "shimmer 1.4s infinite" }} />
        </div>
      </div>
      <div style={{ height: 12, width: "90%", background: theme.border, borderRadius: 4, marginBottom: 8, animation: "shimmer 1.4s infinite" }} />
      <div style={{ height: 12, width: "70%", background: theme.border, borderRadius: 4, marginBottom: 14, animation: "shimmer 1.4s infinite" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 38, background: theme.border, borderRadius: 9, animation: "shimmer 1.4s infinite" }} />
        <div style={{ height: 38, background: theme.border, borderRadius: 9, animation: "shimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}

// ─── Mini bar chart (hero slider) ─────────────────────────
export function MiniBarChart({ data, hot }) {
  const max = Math.max(...data.map(d => d.value));
  const barColor = hot ? theme.red : theme.accent;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 52, padding: "0 0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${(d.value / max) * 100}%`, background: i === data.length - 1 ? barColor : `${barColor}44`, borderRadius: "3px 3px 0 0", minHeight: 4 }} />
          </div>
          <span style={{ color: theme.textDim, fontSize: 9, fontFamily: "Inter, sans-serif" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Vote buttons (before/after) ──────────────────────────
export function VoteButtons({ options, split, voted, onVote, hot }) {
  const activeColor = hot ? theme.red : theme.accent;

  if (voted === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => onVote(i)}
            style={{ background: theme.surfaceHigh, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 14px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 13, textAlign: "left", cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = activeColor}
            onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
          >{opt}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {options.map((opt, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: i === voted ? activeColor : theme.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: i === voted ? 600 : 400 }}>{opt} {i === voted && "✓"}</span>
            <span style={{ color: theme.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{split[i]}%</span>
          </div>
          <div style={{ height: 6, background: theme.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${split[i]}%`, height: "100%", background: i === voted ? activeColor : theme.textDim, borderRadius: 3, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────
export function Toggle({ label, icon, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>{icon}</div>
        <span style={{ color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14 }}>{label}</span>
      </div>
      <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? theme.accent : theme.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: value ? "#fff" : theme.textDim, transition: "left 0.2s" }} />
      </div>
    </div>
  );
}
