"use client";

// ProfileScreen — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.

export function ProfileScreen({ onGoHome, onLogout }) {
  const [tab, setTab] = useState("polls"); // "polls"|"stats"
  const [moderatingId, setModeratingId] = useState(null);

  const user = { name:"Marta Kowalska", handle:"@marta_k", avatar:"M", joined:"Dołączyła w marcu 2025" };
  const profileStats = [
    { value: "24", label: "sondy" },
    { value: "1.2k", label: "głosy" },
    { value: "98%", label: "aktywność" },
  ];
  const myPolls = [
    { id: 1, tag: "#polityka", status: "active", question: "Czy warto wprowadzić 4-dniowy tydzień pracy?", split: [64, 36], votes: 1240, comments: 18, created: "2 dni temu" },
    { id: 2, tag: "#technologia", status: "finished", question: "Czy AI powinno być częścią edukacji szkolnej?", split: [58, 42], votes: 890, comments: 9, created: "5 dni temu" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
      <StickyHeader nowActive={false} onGoHome={onGoHome}/>
      <div style={{ flex:1, overflowY:"auto", paddingTop:64, WebkitOverflowScrolling:"touch", minHeight:0 }}>

        {/* Profile header */}
        <div style={{ padding:"24px 16px 16px", textAlign:"center", borderBottom:`1px solid ${theme.border}` }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:theme.indigo, border:`2px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:28, color:theme.accent, fontWeight:700, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            {user.avatar}
          </div>
          <h2 style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:18, fontWeight:700, margin:"0 0 2px" }}>{user.name}</h2>
          <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, margin:"0 0 4px" }}>{user.handle}</p>
          <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, margin:0 }}>{user.joined}</p>

          {/* Stats row */}
          <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:18 }}>
            {profileStats.map((s,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:18, fontWeight:800, margin:"0 0 2px" }}>{s.value}</p>
                <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:10, margin:0, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${theme.border}`, padding:"0 16px" }}>
          {[{k:"polls",l:"Moje sondy"},{k:"stats",l:"Statystyki"}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ background:"none", border:"none", borderBottom: tab===t.k ? `2px solid ${theme.accent}` : "2px solid transparent", padding:"12px 16px", color: tab===t.k ? theme.accent : theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight: tab===t.k ? 600 : 400, cursor:"pointer" }}>{t.l}</button>
          ))}
        </div>

        {tab === "polls" && (
          <div style={{ padding:"12px 12px 0" }}>
            {myPolls.map(p => (
              <div key={p.id} style={{ background:theme.surface, borderRadius:14, padding:"14px", marginBottom:10, border:`1px solid ${theme.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <Tag>{p.tag}</Tag>
                  <span style={{
                    background: p.status==="active" ? theme.accentDim : theme.surfaceHigh,
                    color: p.status==="active" ? theme.accentBright : theme.textDim,
                    fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:4, fontFamily:"Inter, sans-serif", letterSpacing:"0.05em",
                  }}>
                    {p.status==="active" ? "● AKTYWNA" : "ZAKOŃCZONA"}
                  </span>
                </div>

                <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:14, fontWeight:600, lineHeight:1.4, margin:"0 0 10px" }}>{p.question}</p>

                {/* Mini results bar */}
                <div style={{ display:"flex", height:6, borderRadius:3, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ width:`${p.split[0]}%`, background:theme.accent }}/>
                  <div style={{ width:`${p.split[1]}%`, background:theme.textDim }}/>
                </div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", gap:14 }}>
                    <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif" }}>{p.votes.toLocaleString()} głosów</span>
                    <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif", display:"flex", alignItems:"center", gap:4 }}>
                      <MessageCircle size={11} strokeWidth={1.8}/> {p.comments}
                    </span>
                    <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif" }}>{p.created}</span>
                  </div>
                  <button onClick={() => setModeratingId(moderatingId === p.id ? null : p.id)} style={{ background:"none", border:"none", color:theme.accent, fontFamily:"Inter, sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Moderuj
                  </button>
                </div>

                {/* Moderation panel — expands inline */}
                {moderatingId === p.id && (
                  <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${theme.border}`, display:"flex", flexDirection:"column", gap:8 }}>
                    <button style={{ background:theme.surfaceHigh, border:`1px solid ${theme.border}`, borderRadius:8, padding:"9px 12px", color:theme.text, fontFamily:"Inter, sans-serif", fontSize:12, textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                      <Eye size={14} color={theme.textMuted} strokeWidth={1.8}/> Zobacz szczegółowe statystyki
                    </button>
                    <button style={{ background:theme.surfaceHigh, border:`1px solid ${theme.border}`, borderRadius:8, padding:"9px 12px", color:theme.text, fontFamily:"Inter, sans-serif", fontSize:12, textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                      <MessageCircle size={14} color={theme.textMuted} strokeWidth={1.8}/> Zarządzaj komentarzami
                    </button>
                    {p.status==="active" && (
                      <button style={{ background:`${theme.red}12`, border:`1px solid ${theme.redBorder}`, borderRadius:8, padding:"9px 12px", color:theme.red, fontFamily:"Inter, sans-serif", fontSize:12, textAlign:"left", cursor:"pointer", fontWeight:600 }}>
                        Zakończ głosowanie
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ height:20 }}/>
          </div>
        )}

        {tab === "stats" && (
          <div style={{ padding:"16px 16px 0" }}>
            <div style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"16px", marginBottom:12 }}>
              <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", margin:"0 0 12px" }}>Aktywność w czasie</p>
              <MiniBarChart data={[{label:"Sty",value:30},{label:"Lut",value:55},{label:"Mar",value:48},{label:"Kwi",value:72},{label:"Maj",value:90},{label:"Cze",value:100}]}/>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <div style={{ flex:1, background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"14px" }}>
                <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:10, margin:"0 0 6px", textTransform:"uppercase" }}>Najlepsza sonda</p>
                <p style={{ color:theme.text, fontFamily:"Inter, sans-serif", fontSize:12, lineHeight:1.4, margin:0 }}>Czy Twoja firma wprowadziła pracę zdalną na stałe?</p>
                <p style={{ color:theme.accent, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:16, fontWeight:800, margin:"6px 0 0" }}>3 201 głosów</p>
              </div>
            </div>
            <div style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"16px" }}>
              <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", margin:"0 0 10px" }}>Eksport danych</p>
              <button style={{ width:"100%", background:theme.surfaceHigh, border:`1px solid ${theme.border}`, borderRadius:9, padding:"11px", color:theme.text, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>Pobierz wszystkie dane (CSV)</button>
            </div>
            <div style={{ height:20 }}/>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding:"4px 16px 90px" }}>
          <button onClick={onLogout} style={{ width:"100%", background:"none", border:`1px solid ${theme.border}`, borderRadius:10, padding:"12px", color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, cursor:"pointer" }}>Wyloguj się</button>
        </div>
      </div>
    </div>
  );
}


