"use client";

// SharedPollScreen — wyświetla pojedynczą sondę do udostępniania
import { useState, useEffect } from "react";
import { MessageCircle, Share2, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import { castVote, getMyVote, getPollResults } from "@/lib/queries";
import { getAnonSessionId } from "@/lib/anonSession";

export function SharedPollScreen({ poll, initialResults, onGoToPortal }) {
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [results, setResults] = useState(initialResults || []);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();
  const goToPortal = onGoToPortal || (() => {
    window.location.href = "/";
  });

  // Sprawdź czy użytkownik już zagłosował przy ładowaniu
  useEffect(() => {
    const checkExistingVote = async () => {
      try {
        const anonSession = getAnonSessionId();
        const { data: { user } } = await supabase.auth.getUser();

        const myVote = await getMyVote(supabase, {
          pollId: poll.id,
          userId: user?.id || null,
          anonSession: user?.id ? null : anonSession,
        });

        if (myVote) {
          setVotedOptionId(myVote);
        }
      } catch (err) {
        console.error("Error checking existing vote:", err);
      }
    };

    checkExistingVote();
  }, [poll.id]);

  const handleVote = async (optionId) => {
    if (voting || votedOptionId) return;
    setVoting(true);
    setError(null);

    try {
      const anonSession = getAnonSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      await castVote(supabase, {
        pollId: poll.id,
        optionId,
        userId: user?.id || null,
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

  const handleCopy = async () => {
    const shareUrl = `https://sondal.top/x/${poll.slug}`;
    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: poll.question });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const options = poll.poll_options || [];
  const totalVotes = results.reduce((sum, r) => sum + (r.vote_count || 0), 0);

  const author = poll.is_anonymous ? "Anonim" : (poll.profiles?.handle || "Anonim");
  const avatar = poll.is_anonymous ? "?" : (poll.profiles?.avatar_letter || "?");
  const time = new Date(poll.created_at).toLocaleDateString("pl-PL");

  return (
    <div style={{ background:theme.bg, minHeight:"100dvh", maxWidth:430, margin:"0 auto", display:"flex", flexDirection:"column", fontFamily:"Inter, sans-serif" }}>

      {/* Minimal header — no nav, no search, just brand */}
      <div onClick={goToPortal} style={{ height:64, padding:"0 16px", borderBottom:`1px solid ${theme.border}`, display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:theme.accentDim, border:`1px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:theme.accent, fontWeight:700 }}>S</div>
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
            <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:18, color:theme.text, letterSpacing:"-0.5px" }}>sondal</span>
            <span style={{ fontFamily:"Inter, sans-serif", fontWeight:500, fontSize:12, color:theme.accent }}>.top</span>
          </div>
          <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:8, margin:0, letterSpacing:"0.06em", textTransform:"uppercase" }}>Sonda to argument.</p>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px", WebkitOverflowScrolling:"touch", minHeight:0 }}>

        {/* Poll card — centered, standalone */}
        <div style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:16, padding:"20px 18px", marginBottom:20 }}>

          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:theme.indigo, border:`1px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:theme.accent, fontWeight:700, flexShrink:0 }}>{avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ color:theme.text, fontSize:13, fontFamily:"Inter, sans-serif", fontWeight:600 }}>{author}</span>
                <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif" }}>{time}</span>
              </div>
              <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif" }}>{poll.category}</span>
            </div>
          </div>

          <h1 style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:19, fontWeight:700, lineHeight:1.4, margin:"0 0 18px" }}>{poll.question}</h1>

          {error && (
            <p style={{ color: theme.red, fontSize: 11, margin: "8px 0 0", fontFamily: "Inter, sans-serif" }}>{error}</p>
          )}

          {!votedOptionId ? (
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={voting}
                  style={{ background:theme.surfaceHigh, border:`1px solid ${theme.border}`, borderRadius:11, padding:"14px 16px", color:theme.text, fontFamily:"Inter, sans-serif", fontSize:14, textAlign:"left", cursor: voting ? "wait" : "pointer", transition:"border-color 0.15s", opacity: voting ? 0.6 : 1 }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=theme.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}
                >{opt.label}</button>
              ))}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {options.map((opt) => {
                const result = results.find(r => r.option_id === opt.id);
                const count = result?.vote_count || 0;
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isVoted = votedOptionId === opt.id;

                return (
                  <div key={opt.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ color: isVoted ? theme.accentBright : theme.textMuted, fontSize:13, fontFamily:"Inter, sans-serif", fontWeight: isVoted ? 600 : 400 }}>{opt.label} {isVoted && "✓"}</span>
                      <span style={{ color:theme.textMuted, fontSize:13, fontFamily:"Inter, sans-serif", fontWeight:700 }}>{percentage}%</span>
                    </div>
                    <div style={{ height:8, background:theme.border, borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${percentage}%`, height:"100%", background: isVoted ? theme.accent : theme.textDim, borderRadius:4, transition:"width 0.6s ease" }}/>
                    </div>
                  </div>
                );
              })}
              <p style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif", marginTop:6 }}>{totalVotes.toLocaleString()} głosów łącznie</p>
            </div>
          )}

          {/* Share row */}
          <div style={{ display:"flex", gap:8, marginTop:18, paddingTop:16, borderTop:`1px solid ${theme.border}` }}>
            <button onClick={handleCopy} style={{ flex:1, background:theme.bg, border:`1px solid ${theme.border}`, borderRadius:9, padding:"10px", color: copied ? theme.green : theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {copied ? "✓ Skopiowano" : <><Share2 size={14} strokeWidth={1.8}/> Udostępnij</>}
            </button>
            <button style={{ flex:1, background:theme.bg, border:`1px solid ${theme.border}`, borderRadius:9, padding:"10px", color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <MessageCircle size={14} strokeWidth={1.8}/> Komentarze
            </button>
          </div>
        </div>

        {/* CTA — odkryj resztę portalu */}
        <div style={{ background:`linear-gradient(135deg, ${theme.accentDim}, ${theme.indigoDim})`, border:`1px solid ${theme.borderAccent}`, borderRadius:14, padding:"18px 16px", textAlign:"center" }}>
          <BarChart2 size={26} color={theme.accent} strokeWidth={1.5} style={{ marginBottom:10 }}/>
          <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700, margin:"0 0 6px" }}>Zobacz więcej sond na sondal.top</p>
          <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:12, margin:"0 0 14px", lineHeight:1.5 }}>Fakty zestawione z opinią ludzi. Dane GUS, Banku Światowego i tysięcy głosów społeczności.</p>
          <button onClick={goToPortal} style={{ background:theme.accent, color:"#fff", border:"none", borderRadius:10, padding:"11px 24px", fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Odkryj portal →
          </button>
        </div>

        <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, textAlign:"center", marginTop:20 }}>
          sondal.top — Sonda to argument.
        </p>
      </div>
    </div>
  );
}

