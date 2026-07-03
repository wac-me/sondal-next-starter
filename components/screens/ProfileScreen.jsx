"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Share2, Eye, EyeOff, Trash2, StopCircle, ChevronRight, BarChart2, LogOut, Settings } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark, Tag, EmptyState, SkeletonCard } from "@/components/ui";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { createClient } from "@/lib/supabase/client";
import {
  getMyProfile,
  getMyPolls,
  getPollVoteCounts,
  getPollCommentCounts,
  togglePollVisibility,
  endPoll,
  deletePoll,
  updateProfile,
} from "@/lib/queries";

// ─── Mini bar (wynik sondy) ────────────────────────────────
function ResultBar({ split }) {
  if (!split || split.length < 2) return null;
  return (
    <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", margin: "8px 0" }}>
      {split.map((pct, i) => (
        <div key={i} style={{ width: `${pct}%`, background: i === 0 ? theme.accent : theme.textDim }} />
      ))}
    </div>
  );
}

// ─── Karta sondy w profilu ────────────────────────────────
function MyPollCard({ poll, voteCount, commentCount, onToggleVisibility, onEndPoll, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEnded = poll.ends_at && new Date(poll.ends_at) < new Date();

  const handle = async (action) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <div style={{ background: theme.surface, borderRadius: 14, padding: "14px", marginBottom: 10, border: `1px solid ${theme.border}` }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <Tag>{poll.category}</Tag>
        <span style={{
          background: isEnded ? theme.surfaceHigh : (poll.is_public ? theme.accentDim : theme.redDim),
          color: isEnded ? theme.textDim : (poll.is_public ? theme.accentBright : theme.red),
          fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
          fontFamily: "Inter, sans-serif", letterSpacing: "0.05em",
        }}>
          {isEnded ? "ZAKOŃCZONA" : (poll.is_public ? "● PUBLICZNA" : "🔒 PRYWATNA")}
        </span>
      </div>

      {/* Pytanie */}
      <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, lineHeight: 1.4, margin: "0 0 8px" }}>
        {poll.question}
      </p>

      {/* Opcje (mały podgląd) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {(poll.poll_options || []).sort((a, b) => a.position - b.position).map((opt, i) => (
          <span key={opt.id} style={{ background: theme.surfaceHigh, color: theme.textMuted, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "Inter, sans-serif" }}>
            {String.fromCharCode(65 + i)}. {opt.label}
          </span>
        ))}
      </div>

      {/* Statystyki */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 8, borderTop: `1px solid ${theme.border}` }}>
        <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif" }}>
          <strong style={{ color: theme.text }}>{(voteCount || 0).toLocaleString()}</strong> głosów
        </span>
        <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
          <MessageCircle size={11} strokeWidth={1.8} />
          <strong style={{ color: theme.text }}>{commentCount || 0}</strong>
        </span>
        <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif", marginLeft: "auto" }}>
          {new Date(poll.created_at).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
        </span>
        <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", color: theme.accent, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, cursor: "pointer", padding: 0 }}>
          {expanded ? "Zwiń ▲" : "Opcje ▼"}
        </button>
      </div>

      {/* Panel moderacji */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Link do sondy */}
          <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 11 }}>
              sondal.top/x/{poll.slug}
            </span>
            <button
              onClick={() => navigator.clipboard?.writeText(`https://sondal.top/x/${poll.slug}`)}
              style={{ background: "none", border: "none", color: theme.accent, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Kopiuj
            </button>
          </div>

          {/* Zmień widoczność */}
          <button
            onClick={() => handle(() => onToggleVisibility(poll.id, !poll.is_public))}
            disabled={loading || isEnded}
            style={{ background: theme.surfaceHigh, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 12, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading || isEnded ? 0.5 : 1 }}>
            {poll.is_public
              ? <><EyeOff size={14} color={theme.textMuted} strokeWidth={1.8} /> Ustaw jako prywatną</>
              : <><Eye size={14} color={theme.textMuted} strokeWidth={1.8} /> Ustaw jako publiczną</>
            }
          </button>

          {/* Zakończ głosowanie */}
          {!isEnded && (
            <button
              onClick={() => handle(() => onEndPoll(poll.id))}
              disabled={loading}
              style={{ background: theme.surfaceHigh, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 12, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.5 : 1 }}>
              <StopCircle size={14} color={theme.textMuted} strokeWidth={1.8} /> Zakończ głosowanie
            </button>
          )}

          {/* Udostępnij */}
          <button
            onClick={() => navigator.share?.({ url: `https://sondal.top/x/${poll.slug}`, title: poll.question })}
            style={{ background: theme.surfaceHigh, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "10px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 12, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Share2 size={14} color={theme.textMuted} strokeWidth={1.8} /> Udostępnij sondę
          </button>

          {/* Usuń */}
          <button
            onClick={() => {
              if (window.confirm("Na pewno usunąć tę sondę? Tej operacji nie można cofnąć.")) {
                handle(() => onDelete(poll.id));
              }
            }}
            disabled={loading}
            style={{ background: theme.redDim, border: `1px solid ${theme.redBorder}`, borderRadius: 9, padding: "10px 12px", color: theme.red, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.5 : 1 }}>
            <Trash2 size={14} strokeWidth={1.8} /> Usuń sondę
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Główny ProfileScreen ──────────────────────────────────
export function ProfileScreen({ onGoHome, onLogout }) {
  const [tab, setTab]         = useState("polls"); // "polls" | "discuss" | "settings"
  const [profile, setProfile] = useState(null);
  const [polls, setPolls]     = useState([]);
  const [voteCounts, setVoteCounts]     = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editHandle, setEditHandle] = useState("");
  const [editName, setEditName]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const supabase = createClient();

  // Pobierz dane przy montowaniu
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const prof = await getMyProfile(supabase);
      if (!prof) { onLogout(); return; }
      setProfile(prof);
      setEditHandle(prof.handle || "");
      setEditName(prof.display_name || "");

      const myPolls = await getMyPolls(supabase, prof.id);
      setPolls(myPolls);

      if (myPolls.length) {
        const ids = myPolls.map(p => p.id);
        const [votes, comments] = await Promise.all([
          getPollVoteCounts(supabase, ids),
          getPollCommentCounts(supabase, ids),
        ]);
        setVoteCounts(votes);
        setCommentCounts(comments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (pollId, newValue) => {
    await togglePollVisibility(supabase, pollId, newValue);
    setPolls(ps => ps.map(p => p.id === pollId ? { ...p, is_public: newValue } : p));
  };

  const handleEndPoll = async (pollId) => {
    await endPoll(supabase, pollId);
    const now = new Date().toISOString();
    setPolls(ps => ps.map(p => p.id === pollId ? { ...p, ends_at: now } : p));
  };

  const handleDelete = async (pollId) => {
    await deletePoll(supabase, pollId);
    setPolls(ps => ps.filter(p => p.id !== pollId));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(supabase, profile.id, { handle: editHandle, display_name: editName });
      setProfile(p => ({ ...p, handle: editHandle, display_name: editName }));
      setSaveMsg("Zapisano!");
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (err) {
      setSaveMsg("Błąd: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + Number(b), 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <StickyHeader nowActive={false} onGoHome={onGoHome} />

      <div style={{ flex: 1, overflowY: "auto", paddingTop: 64, WebkitOverflowScrolling: "touch", minHeight: 0 }}>

        {loading ? (
          <div style={{ padding: 16 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* ── Avatar + stats ── */}
            <div style={{ padding: "24px 16px 16px", textAlign: "center", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: theme.indigo, border: `2px solid ${theme.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, color: theme.accent, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {(profile?.handle || "U")[1]?.toUpperCase() || "U"}
              </div>
              <h2 style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: "0 0 2px" }}>
                {profile?.display_name || profile?.handle || "Użytkownik"}
              </h2>
              <p style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 13, margin: "0 0 4px" }}>
                {profile?.handle}
              </p>
              <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 11, margin: 0 }}>
                {profile?.email}
              </p>

              {/* Statystyki */}
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 18 }}>
                {[
                  { label: "Sondy", value: polls.length },
                  { label: "Głosy", value: totalVotes.toLocaleString() },
                  { label: "Aktywne", value: polls.filter(p => !p.ends_at || new Date(p.ends_at) > new Date()).length },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}` }}>
              {[
                { k: "polls",    l: "Moje sondy" },
                { k: "discuss",  l: "Dyskusje" },
                { k: "settings", l: "Ustawienia" },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ background: "none", border: "none", borderBottom: tab === t.k ? `2px solid ${theme.accent}` : "2px solid transparent", padding: "12px 16px", color: tab === t.k ? theme.accent : theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: tab === t.k ? 600 : 400, cursor: "pointer", flex: 1 }}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* ── TAB: Moje sondy ── */}
            {tab === "polls" && (
              <div style={{ padding: "12px 12px 0" }}>
                {polls.length === 0 ? (
                  <EmptyState
                    icon={<BarChart2 size={28} color={theme.accent} strokeWidth={1.5} />}
                    title="Brak sond"
                    subtitle="Nie masz jeszcze żadnych sond. Stwórz pierwszą — to zajmie 10 sekund."
                    actionLabel="Stwórz sondę"
                    onAction={onGoHome}
                  />
                ) : (
                  polls.map(poll => (
                    <MyPollCard
                      key={poll.id}
                      poll={poll}
                      voteCount={voteCounts[poll.id]}
                      commentCount={commentCounts[poll.id]}
                      onToggleVisibility={handleToggleVisibility}
                      onEndPoll={handleEndPoll}
                      onDelete={handleDelete}
                    />
                  ))
                )}
                <div style={{ height: 20 }} />
              </div>
            )}

            {/* ── TAB: Dyskusje ── */}
            {tab === "discuss" && (
              <div style={{ padding: "12px 16px" }}>
                <EmptyState
                  icon={<MessageCircle size={28} color={theme.accent} strokeWidth={1.5} />}
                  title="Brak dyskusji"
                  subtitle="Zagłosuj w sondzie i dodaj komentarz — Twoje wątki pojawią się tutaj."
                />
              </div>
            )}

            {/* ── TAB: Ustawienia ── */}
            {tab === "settings" && (
              <div style={{ padding: "16px 16px 0" }}>
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                  <p style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 14px" }}>Profil publiczny</p>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Wyświetlana nazwa</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Twoja nazwa"
                      style={{ width: "100%", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "11px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Handle (@nazwa)</label>
                    <input value={editHandle} onChange={e => setEditHandle(e.target.value)} placeholder="@twoja_nazwa"
                      style={{ width: "100%", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "11px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
                  </div>

                  {saveMsg && (
                    <p style={{ color: saveMsg.startsWith("Błąd") ? theme.red : theme.green, fontFamily: "Inter, sans-serif", fontSize: 12, margin: "0 0 10px" }}>{saveMsg}</p>
                  )}

                  <button onClick={handleSaveProfile} disabled={saving}
                    style={{ width: "100%", background: theme.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Zapisywanie…" : "Zapisz zmiany"}
                  </button>
                </div>

                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                  <p style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>Konto</p>
                  <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 12, margin: "0 0 14px" }}>Email: {profile?.email}</p>
                  <button onClick={handleLogout}
                    style={{ width: "100%", background: "none", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px", color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <LogOut size={16} strokeWidth={1.8} /> Wyloguj się
                  </button>
                </div>

                <div style={{ height: 20 }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
