"use client";

import { useState } from "react";
import { ChevronRight, Lock, Eye } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark } from "@/components/ui";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { createClient } from "@/lib/supabase/client";

export function LoginScreen({ onGoHome, onLoggedIn }) {
  const [mode, setMode]       = useState("login"); // "login"|"register"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const supabase = createClient();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        // ── Logowanie ──────────────────────────────────────
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

      } else {
        // ── Rejestracja ────────────────────────────────────
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { handle: handle || `@user_${Math.random().toString(36).slice(2, 8)}` },
          },
        });
        if (error) throw error;
      }

      // Sukces — poinformuj rodzica żeby przełączył na ProfileScreen
      onLoggedIn();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <StickyHeader nowActive={false} onGoHome={onGoHome} />
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 64, padding: "80px 24px 24px", WebkitOverflowScrolling: "touch", minHeight: 0 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div onClick={onGoHome} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 20, background: theme.accentDim, border: `1px solid ${theme.borderAccent}`, marginBottom: 16, cursor: onGoHome ? "pointer" : "default" }}>
            <LogoMark size={44} />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: theme.text, margin: "0 0 6px" }}>
            {mode === "login" ? "Witaj z powrotem" : "Dołącz do sondal.top"}
          </h2>
          <p style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 14, margin: 0 }}>
            {mode === "login" ? "Zaloguj się do swojego konta" : "Sonda to argument. Zacznij teraz."}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: theme.surface, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{ flex: 1, background: mode === m ? theme.accent : "none", border: "none", borderRadius: 9, padding: "10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: mode === m ? "#fff" : theme.textMuted, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: theme.redDim, border: `1px solid ${theme.redBorder}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ color: theme.red, fontFamily: "Inter, sans-serif", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {mode === "register" && (
            <div>
              <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nazwa użytkownika</label>
              <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@twoja_nazwa"
                style={{ width: "100%", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "13px 14px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
            </div>
          )}
          <div>
            <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="twoj@email.pl"
              style={{ width: "100%", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "13px 14px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
          </div>
          <div>
            <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Hasło</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: "100%", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "13px 14px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
          </div>
        </div>

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <span style={{ color: theme.accent, fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>Zapomniałem hasła</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", background: loading ? theme.surface : theme.accent, color: loading ? theme.textDim : "#fff", border: "none", borderRadius: 12, padding: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, cursor: loading ? "wait" : "pointer", marginBottom: 20, transition: "all 0.2s" }}>
          {loading ? "Ładowanie…" : (mode === "login" ? "Zaloguj się" : "Utwórz konto")} {!loading && "→"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          <span style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 12 }}>lub</span>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>

        {/* Social */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleGoogle}
            style={{ width: "100%", background: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "14px", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33C2.44 15.98 5.48 18 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            Kontynuuj z Google
          </button>
        </div>

        <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Rejestrując się akceptujesz{" "}
          <span style={{ color: theme.accent, cursor: "pointer" }}>Regulamin</span> i{" "}
          <span style={{ color: theme.accent, cursor: "pointer" }}>Politykę prywatności</span>
        </p>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
