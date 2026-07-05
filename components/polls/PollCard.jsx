"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { Tag } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { castVote, getMyVote, getPollResults, subscribeToVotes } from "@/lib/queries";
import { getAnonSessionId } from "@/lib/anonSession";

// ─── Paski wyników ────────────────────────────────────────
function ResultBars({ options, results, votedOptionId }) {
  const total = results.reduce((sum, r) => sum + Number(r.vote_count), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(opt => {
        const result  = results.find(r => r.option_id === opt.id);
        const pct     = result ? Number(result.percentage) : 0;
        const isVoted = opt.id === votedOptionId;
        return (
          <div key={opt.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: isVoted ? theme.accentBright : theme.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: isVoted ? 600 : 400 }}>
                {opt.label} {isVoted && "✓"}
              </span>
              <span style={{ color: theme.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: theme.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: isVoted ? theme.accent : theme.textDim, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        );
      })}
      <p style={{ color: theme.textDim, fontSize: 11, margin: "2px 0 0", fontFamily: "Inter, sans-serif" }}>
        {total.toLocaleString()} głosów łącznie
      </p>
    </div>
  );
}

// ─── PollCard ─────────────────────────────────────────────
export function PollCard({ poll }) {
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [results,       setResults]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [voting,        setVoting]        = useState(false);
  const [error,         setError]         = useState(null);

  const supabase = createClient();
  const options  = (poll.poll_options || []).sort((a, b) => a.position - b.position);
  const isEnded  = poll.ends_at && new Date(poll.ends_at) < new Date();
  const hasVoted = votedOptionId !== null;
  const isTempPoll = !poll.id || poll.id.startsWith("temp-");

  // Sprawdź czy już głosowano + pobierz wyniki
  useEffect(() => {
    if (isTempPoll) { setLoading(false); return; }

    const init = async () => {
      try {
        const anonSession = getAnonSessionId();
        const { data: { user } } = await supabase.auth.getUser();

        const myVoteOptionId = await getMyVote(supabase, {
          pollId:      poll.id,
          userId:      user?.id || null,
          anonSession: user?.id ? null : anonSession,
        });

        if (myVoteOptionId) {
          setVotedOptionId(myVoteOptionId);
          const res = await getPollResults(supabase, poll.id);
          setResults(res);
        }
      } catch (err) {
        console.error("PollCard init:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [poll.id]);

  // Realtime — aktualizuj wyniki gdy ktoś głosuje
  useEffect(() => {
    if (isTempPoll || !hasVoted) return;

    const channel = subscribeToVotes(supabase, poll.id, async () => {
      const res = await getPollResults(supabase, poll.id);
      setResults(res);
    });

    return () => channel.unsubscribe();
  }, [poll.id, hasVoted]);

  // Oddaj głos
  const handleVote = async (optionId) => {
    if (voting || hasVoted || isEnded) return;
    setVoting(true);
    setError(null);

    try {
      const anonSession = getAnonSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      await castVote(supabase, {
        pollId:      poll.id,
        optionId,
        userId:      user?.id || null,
        anonSession: user?.id ? null : anonSession,
      });

      setVotedOptionId(optionId);
      const res = await getPollResults(supabase, poll.id);
      setResults(res);

    } catch (err) {
      if (err.message === "Już zagłosowałeś w tej sondzie") {
        const myVote = await getMyVote(supabase, {
          pollId: poll.id,
          userId: null,
          anonSession: getAnonSessionId(),
        });
        if (myVote) {
          setVotedOptionId(myVote);
          const res = await getPollResults(supabase, poll.id);
          setResults(res);
        }
      } else {
        setError("Błąd głosowania — spróbuj ponownie");
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div style={{ background: theme.surface, borderRadius: 14, padding: "14px 14px 12px", marginBottom: 10, border: `1px solid ${theme.border}` }}>

      {/* Autor + kategoria */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.indigo, border: `1px solid ${theme.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: theme.accent, fontWeight: 700, flexShrink: 0 }}>
            {poll.is_anonymous ? "?" : (poll.profiles?.avatar_letter || "?")}
          </div>
          <div>
            <span style={{ color: theme.text, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {poll.is_anonymous ? "Anonim" : (poll.profiles?.handle || "Anonim")}
            </span>
            <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif", marginLeft: 6 }}>
              {poll.created_at ? new Date(poll.created_at).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }) : ""}
            </span>
          </div>
        </div>
        <Tag>{poll.category || poll.tag}</Tag>
      </div>

      {/* Pytanie */}
      <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: "0 0 12px" }}>
        {poll.question}
      </p>

      {/* Zakończona */}
      {isEnded && (
        <div style={{ background: theme.redDim, borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
          <span style={{ color: theme.red, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600 }}>Głosowanie zakończone</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 38, background: theme.border, borderRadius: 9, animation: "shimmer 1.4s infinite" }} />
          ))}
        </div>

      ) : hasVoted || isEnded ? (
        <ResultBars options={options} results={results} votedOptionId={votedOptionId} />

      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {options.map(opt => (
            <button key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={voting}
              style={{ background: theme.surfaceHigh, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "11px 14px", color: voting ? theme.textDim : theme.text, fontFamily: "Inter, sans-serif", fontSize: 13, textAlign: "left", cursor: voting ? "wait" : "pointer", opacity: voting ? 0.7 : 1, transition: "border-color 0.15s" }}
              onMouseEnter={e => { if (!voting) e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; }}
            >
              {voting ? "Zapisywanie…" : opt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p style={{ color: theme.red, fontSize: 11, margin: "8px 0 0", fontFamily: "Inter, sans-serif" }}>{error}</p>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
        <span style={{ color: theme.textDim, fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <MessageCircle size={13} strokeWidth={1.8} /> Dyskusja
        </span>
        <span
          onClick={async () => {
            const shareUrl = `https://sondal.top/x/${poll.slug}`;
            if (navigator.share) {
              await navigator.share({ url: shareUrl, title: poll.question });
            } else {
              await navigator.clipboard.writeText(shareUrl);
              alert("Link skopiowany do schowka!");
            }
          }}
          style={{ color: theme.textDim, fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Share2 size={13} strokeWidth={1.8} /> Udostępnij
        </span>
      </div>
    </div>
  );
}
