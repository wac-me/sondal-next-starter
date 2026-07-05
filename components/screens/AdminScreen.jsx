"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, EyeOff, ArrowLeft, BarChart2, Users, MessageSquare, Share2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import { getAllPolls, deletePoll, togglePollVisibility } from "@/lib/queries";

export function AdminScreen({ onGoHome }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const data = await getAllPolls(supabase);
      setPolls(data);
    } catch (err) {
      setError("Nie udało się załadować sond");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    if (!confirm("Czy na pewno chcesz usunąć tę sondę?")) return;

    try {
      setActionLoading(pollId);
      await deletePoll(supabase, pollId);
      setPolls(prev => prev.filter(p => p.id !== pollId));
    } catch (err) {
      setError("Nie udało się usunąć sondy");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (pollId, currentVisibility) => {
    try {
      setActionLoading(pollId);
      await togglePollVisibility(supabase, pollId, !currentVisibility);
      setPolls(prev => prev.map(p =>
        p.id === pollId ? { ...p, is_public: !currentVisibility } : p
      ));
    } catch (err) {
      setError("Nie udało się zmienić widoczności");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async (slug) => {
    const shareUrl = `https://sondal.top/x/${slug}`;
    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: "Sonda z sondal.top" });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link skopiowany do schowka!");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: "center", color: theme.textMuted }}>
        Ładowanie...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ 
        height: 64, 
        padding: "0 16px", 
        borderBottom: `1px solid ${theme.border}`, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        background: `${theme.bg}F4`,
        backdropFilter: "blur(14px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onGoHome} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <ArrowLeft size={20} color={theme.textMuted} strokeWidth={2} />
          </button>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: theme.text, margin: 0 }}>
              Panel Admina
            </h2>
            <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 11, margin: 0 }}>
              Zarządzanie sondami
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", WebkitOverflowScrolling: "touch" }}>
        {error && (
          <div style={{ background: theme.redDim, border: `1px solid ${theme.redBorder}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ color: theme.red, fontFamily: "Inter, sans-serif", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: theme.surface, borderRadius: 12, padding: 16, border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BarChart2 size={18} color={theme.accent} strokeWidth={1.8} />
              <span style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600 }}>SONDY</span>
            </div>
            <p style={{ color: theme.text, fontSize: 24, fontWeight: 800, margin: 0 }}>{polls.length}</p>
          </div>
          <div style={{ flex: 1, background: theme.surface, borderRadius: 12, padding: 16, border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Eye size={18} color={theme.green} strokeWidth={1.8} />
              <span style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600 }}>PUBLICZNE</span>
            </div>
            <p style={{ color: theme.text, fontSize: 24, fontWeight: 800, margin: 0 }}>
              {polls.filter(p => p.is_public).length}
            </p>
          </div>
        </div>

        {/* Polls List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {polls.map(poll => (
            <div key={poll.id} style={{ 
              background: theme.surface, 
              borderRadius: 12, 
              padding: 14, 
              border: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                    {poll.question}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif" }}>
                      {poll.category}
                    </span>
                    <span style={{ color: theme.textDim, fontSize: 11 }}>
                      •
                    </span>
                    <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif" }}>
                      {new Date(poll.created_at).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleShare(poll.slug)}
                    style={{
                      background: theme.surfaceHigh,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      padding: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Udostępnij"
                  >
                    <Share2 size={16} color={theme.accent} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(poll.id, poll.is_public)}
                    disabled={actionLoading === poll.id}
                    style={{
                      background: poll.is_public ? theme.greenDim : theme.surfaceHigh,
                      border: `1px solid ${poll.is_public ? "rgba(34,197,94,0.3)" : theme.border}`,
                      borderRadius: 8,
                      padding: 8,
                      cursor: actionLoading === poll.id ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title={poll.is_public ? "Ukryj" : "Pokaż"}
                  >
                    {poll.is_public ? <Eye size={16} color={theme.green} strokeWidth={1.8} /> : <EyeOff size={16} color={theme.textDim} strokeWidth={1.8} />}
                  </button>
                  <button
                    onClick={() => handleDelete(poll.id)}
                    disabled={actionLoading === poll.id}
                    style={{
                      background: theme.redDim,
                      border: `1px solid ${theme.redBorder}`,
                      borderRadius: 8,
                      padding: 8,
                      cursor: actionLoading === poll.id ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Usuń"
                  >
                    <Trash2 size={16} color={theme.red} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ 
                  background: poll.is_public ? theme.greenDim : theme.surfaceHigh, 
                  color: poll.is_public ? theme.green : theme.textDim, 
                  borderRadius: 6, 
                  padding: "4px 8px", 
                  fontSize: 10, 
                  fontWeight: 600,
                  border: `1px solid ${poll.is_public ? "rgba(34,197,94,0.3)" : theme.border}`
                }}>
                  {poll.is_public ? "Publiczna" : "Prywatna"}
                </span>
                <span style={{ 
                  background: poll.is_anonymous ? theme.surfaceHigh : theme.accentDim, 
                  color: poll.is_anonymous ? theme.textDim : theme.accent, 
                  borderRadius: 6, 
                  padding: "4px 8px", 
                  fontSize: 10, 
                  fontWeight: 600,
                  border: `1px solid ${poll.is_anonymous ? theme.border : theme.borderAccent}`
                }}>
                  {poll.is_anonymous ? "Anonimowa" : "Jawna"}
                </span>
                <span style={{ 
                  background: theme.surfaceHigh, 
                  color: theme.textDim, 
                  borderRadius: 6, 
                  padding: "4px 8px", 
                  fontSize: 10, 
                  fontWeight: 600,
                  border: `1px solid ${theme.border}`
                }}>
                  {poll.kind}
                </span>
              </div>
            </div>
          ))}
        </div>

        {polls.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
            Brak sond w bazie danych
          </div>
        )}
      </div>
    </div>
  );
}
