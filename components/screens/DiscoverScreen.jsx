"use client";

// DiscoverScreen — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { TickerBar } from "@/components/layout/TickerBar";
import { PollCard } from "@/components/polls/PollCard";
import { SondaDetail } from "@/components/screens/SondaDetail";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

const categories = ["#Wszystkie", "#Polityka", "#Technologia", "#Społeczeństwo", "#Gospodarka"];

const trendingPollDetails = {
  1: {
    id: 1,
    tag: "#polityka",
    avatar: "M",
    user: "Marta",
    time: "2h temu",
    question: "Czy warto wprowadzić 4-dniowy tydzień pracy?",
    options: ["Tak", "Nie", "Nie wiem"],
    split: [55, 35, 10],
    totalVotes: 1240,
    comments: []
  }
};

function HeroSlider({ onCreateClick }) {
  return (
    <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ background: theme.surface, borderRadius: 16, padding: 16, border: `1px solid ${theme.border}` }}>
        <p style={{ margin: "0 0 8px", color: theme.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Nowa sonda</p>
        <h3 style={{ margin: "0 0 8px", color: theme.text, fontSize: 17, fontWeight: 700 }}>Zacznij od prostego pytania</h3>
        <p style={{ margin: "0 0 12px", color: theme.textMuted, fontSize: 13, lineHeight: 1.5 }}>Stwórz sondę w kilka chwil i poznaj opinię społeczności.</p>
        <button onClick={onCreateClick} style={{ background: theme.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Stwórz sondę</button>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ flex: 1, background: theme.surface, borderRadius: 12, padding: 12, border: `1px solid ${theme.border}` }}>
        <p style={{ margin: 0, color: theme.text, fontWeight: 700 }}>3.2k</p>
        <p style={{ margin: "4px 0 0", color: theme.textDim, fontSize: 11 }}>aktywnych sond</p>
      </div>
      <div style={{ flex: 1, background: theme.surface, borderRadius: 12, padding: 12, border: `1px solid ${theme.border}` }}>
        <p style={{ margin: 0, color: theme.text, fontWeight: 700 }}>42%</p>
        <p style={{ margin: "4px 0 0", color: theme.textDim, fontSize: 11 }}>nowych głosów</p>
      </div>
    </div>
  );
}

function TrendingSection({ onPollOpen, onShowAll }) {
  return (
    <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: theme.text, fontSize: 15, fontWeight: 700 }}>Na czasie</h3>
        <button onClick={onShowAll} style={{ background: "none", border: "none", color: theme.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Pokaż wszystko</button>
      </div>
      <button onClick={() => onPollOpen(1)} style={{ width: "100%", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "10px 12px", textAlign: "left", color: theme.text, cursor: "pointer" }}>
        Czy warto wprowadzić 4-dniowy tydzień pracy?
      </button>
    </div>
  );
}

export function DiscoverScreen({ onGoToCreate, onShowTrending, onGoHome, communityPolls = [] }) {
  const [activeCat, setActiveCat] = useState("#Wszystkie");
  const [detailId,  setDetailId]  = useState(null);
  const [detailAnim, setDetailAnim] = useState("closed");
  const [feedEmpty, setFeedEmpty]   = useState(false);  // demo toggle

  const openDetail = (id) => {
    setDetailId(id);
    setDetailAnim("entering"); // start off-screen
    setTimeout(() => setDetailAnim("open"), 20); // trigger transition
  };
  const closeDetail = () => {
    setDetailAnim("closing");
    setTimeout(() => { setDetailId(null); setDetailAnim("closed"); }, 340);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <StickyHeader nowActive={true} onCreateClick={onGoToCreate} onShowTrending={onShowTrending} onGoHome={() => { setDetailId(null); onGoHome?.(); }}/>
      <div data-scroll-feed style={{ flex:1, overflowY:"auto", position:"relative", paddingTop:64, WebkitOverflowScrolling:"touch", minHeight:0 }}>
        <TickerBar/>
        <HeroSlider onCreateClick={onGoToCreate}/>
        <StatsBar/>
        <TrendingSection onPollOpen={openDetail} onShowAll={onShowTrending}/>
        <div style={{ display:"flex", gap:7, padding:"10px 16px", overflowX:"auto", scrollbarWidth:"none", borderBottom:`1px solid ${theme.border}` }}>
          {categories.map(cat => (
            <button key={cat} onClick={()=>setActiveCat(cat)} style={{ background: activeCat===cat?theme.accent:theme.surface, color: activeCat===cat?"#fff":theme.textMuted, border:`1px solid ${activeCat===cat?"transparent":theme.border}`, borderRadius:20, padding:"6px 13px", fontSize:11, fontFamily:"Inter, sans-serif", fontWeight: activeCat===cat?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>{cat}</button>
          ))}
        </div>
        <div style={{ padding:"12px 12px 0" }}>
          {/* Demo toggle — empty state */}
          <button onClick={()=>setFeedEmpty(e=>!e)} style={{ background:"none", border:`1px dashed ${theme.border}`, borderRadius:8, padding:"5px 12px", color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:10, cursor:"pointer", marginBottom:8 }}>
            {feedEmpty ? "▶ Pokaż sondy" : "○ Demo: pusty feed"}
          </button>
          {feedEmpty ? (
            <EmptyState
              icon={<BarChart2 size={28} color={theme.accent} strokeWidth={1.5}/>}
              title="Brak sond w tej kategorii"
              subtitle="Nikt jeszcze nie dodał sondy w tym temacie. Bądź pierwszy!"
              actionLabel="Stwórz sondę"
              onAction={onGoToCreate}
            />
          ) : (
            <>
              {communityPolls.map(poll => (
                <PollCard 
                  key={poll.id} 
                  poll={poll}
                  onDiscussClick={() => window.location.href = `/x/${poll.slug}`}
                />
              ))}
            </>
          )}
          <div style={{ height:20 }}/>
        </div>
      </div>

      {/* Sonda Detail — slides in from right */}
      {detailId !== null && trendingPollDetails[detailId] && (
        <div style={{
          position:"absolute", inset:0, zIndex:300,
          transform: (detailAnim==="open") ? "translateX(0)" : "translateX(100%)",
          transition: (detailAnim==="open" || detailAnim==="closing")
            ? "transform 0.38s cubic-bezier(.22,.68,0,1.1)"
            : "none",
        }}>
          <SondaDetail poll={trendingPollDetails[detailId]} onClose={closeDetail} onGoHome={() => { setDetailId(null); onGoHome?.(); }}/>
        </div>
      )}
    </div>
  );
}

