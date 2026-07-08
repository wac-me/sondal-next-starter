"use client";

// TrendingNowScreen — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.
const trendingPolls = [
  { id: 1, tag: "#polityka", question: "Czy warto wprowadzić 4-dniowy tydzień pracy?", votes: 1240 },
  { id: 2, tag: "#technologia", question: "Czy AI zastąpi programistów?", votes: 890 },
  { id: 3, tag: "#społeczeństwo", question: "Czy należy znieść wizy do UE?", votes: 756 },
  { id: 4, tag: "#gospodarka", question: "Czy podnieść minimalną wynagrodzenie?", votes: 543 },
  { id: 5, tag: "#zdrowie", question: "Czy szczepienia powinny być obowiązkowe?", votes: 432 },
  { id: 6, tag: "#edukacja", question: "Czy usunąć lektury ze szkół?", votes: 321 },
  { id: 7, tag: "#środowisko", question: "Czy zakazać plastikowych torebek?", votes: 287 },
  { id: 8, tag: "#sport", question: "Czy Polska zorganizuje olimpiadę?", votes: 198 },
  { id: 9, tag: "#kultura", question: "Czy finansować filmy narodowe?", votes: 156 },
  { id: 10, tag: "#transport", question: "Czy darmowa komunikacja miejska?", votes: 134 },
  { id: 11, tag: "#energetyka", question: "Czy zainwestować w atom?", votes: 112 },
  { id: 12, tag: "#media", question: "Czy regulować media społecznościowe?", votes: 98 },
];

export function TrendingNowScreen({ onBack, onGoHome, onPollOpen, onNavChange, activeNav }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:theme.bg, minHeight:0, overflow:"hidden" }}>
      <div style={{ height:64, padding:"0 16px", borderBottom:`1px solid ${theme.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:`${theme.bg}F4`, backdropFilter:"blur(14px)" }}>
        <div onClick={onGoHome || onBack} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <LogoMark size={28}/>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
              <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:18, color:theme.text, letterSpacing:"-0.5px" }}>sondal</span>
              <span style={{ fontFamily:"Inter, sans-serif", fontWeight:500, fontSize:12, color:theme.accent }}>.top</span>
            </div>
            <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:8, margin:0, letterSpacing:"0.06em", textTransform:"uppercase" }}>Sonda to argument.</p>
          </div>
        </div>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:8 }}>
          <ChevronRight size={22} strokeWidth={2} color={theme.textMuted}/>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 0", WebkitOverflowScrolling:"touch", minHeight:0 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:3, height:16, background:theme.red, borderRadius:2 }}/>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:20, color:theme.text, margin:0 }}>Trending NOW</h2>
          <span style={{ width:7, height:7, borderRadius:"50%", background:theme.red, display:"inline-block", animation:"pulsered 1.8s infinite" }}/>
        </div>

        {/* All trending polls expanded */}
        {[...trendingPolls, ...trendingPolls.map(p => ({ ...p, id:p.id+100, question:"Czy wprowadzenie opłat za wjazd do centrum miast poprawi jakość powietrza?", votes: 3210 }))].map((p,i) => (
          <div key={p.id} onClick={() => onPollOpen && onPollOpen(Math.min(p.id, 12))}
            style={{ background:theme.surface, borderRadius:14, padding:"14px", marginBottom:10, border:`1px solid ${theme.border}`, cursor:"pointer", display:"flex", gap:12, alignItems:"center" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=theme.borderAccent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}>
            <span style={{ color: i < 3 ? theme.accent : theme.textDim, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:22, fontWeight:800, width:28, textAlign:"center", flexShrink:0 }}>{i+1}</span>
            <div style={{ flex:1 }}>
              <Tag>{p.tag}</Tag>
              <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:14, fontWeight:600, margin:"6px 0 4px", lineHeight:1.4 }}>{p.question}</p>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11 }}>{p.votes.toLocaleString()} głosów</span>
                {i < 3 && <span style={{ color:theme.red, fontFamily:"Inter, sans-serif", fontSize:10, fontWeight:700 }}>🔴 HOT</span>}
              </div>
            </div>
            <ChevronRight size={18} color={theme.accent} strokeWidth={1.8}/>
          </div>
        ))}
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

