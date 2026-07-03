"use client";

// PollCard — karta sondy społecznościowej (feed).
// WERSJA MAKIETY: głosowanie lokalne (useState).
// WERSJA PRODUKCYJNA: zastąp setVoted wywołaniem castVote() z lib/queries.js
// i pobierz split z poll_results widoku Supabase.

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { Tag, VoteButtons } from "@/components/ui";

export function PollCard({ poll }) {
  const [voted, setVoted] = useState(null);

  // TODO (produkcja): zamień na:
  // const supabase = createClient();
  // const anonSession = getAnonSessionId();
  // const handleVote = async (i) => {
  //   await castVote(supabase, { pollId: poll.id, optionId: poll.poll_options[i].id, anonSession });
  //   setVoted(i);
  // };

  return (
    <div style={{ background: theme.surface, borderRadius: 14, padding: "14px 14px 12px", marginBottom: 10, border: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.indigo, border: `1px solid ${theme.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: theme.accent, fontWeight: 700, flexShrink: 0 }}>
                        {poll.is_anonymous ? "?" : (poll.profiles?.avatar_letter || poll.avatar || "?")}

          </div>
          <div>
            <span style={{ color: theme.text, fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {poll.profiles?.handle || poll.user || "Anonim"}
            </span>
            <span style={{ color: theme.textDim, fontSize: 11, fontFamily: "Inter, sans-serif", marginLeft: 6 }}>
              {poll.time || ""}
            </span>
          </div>
        </div>
        <Tag>{poll.category || poll.tag}</Tag>
      </div>

      <p style={{ color: theme.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: "0 0 12px" }}>
        {poll.question}
      </p>

      <VoteButtons
        options={(poll.poll_options || []).map(o => o.label).length
          ? (poll.poll_options || []).map(o => o.label)
          : poll.options || []
        }
        split={poll.baseSplit || [50, 50]}
        voted={voted}
        onVote={setVoted}
      />

      {voted !== null && (
        <p style={{ color: theme.textDim, fontSize: 11, margin: "8px 0 0", fontFamily: "Inter, sans-serif" }}>
          {(poll.totalVotes || 0).toLocaleString()} głosów łącznie
        </p>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
        <span style={{ color: theme.textDim, fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <MessageCircle size={13} strokeWidth={1.8} /> Dyskusja
        </span>
        <span style={{ color: theme.textDim, fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Share2 size={13} strokeWidth={1.8} /> Udostępnij
        </span>
      </div>
    </div>
  );
}
