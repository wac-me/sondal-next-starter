"use client";

// SondaDetail — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.

export function SondaDetail({ poll, onClose, onGoHome }) {
  const [voted, setVoted] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all"|"0"|"1"|"2"

  const filteredComments = poll.comments.filter(c =>
    activeTab === "all" ? true : c.vote === parseInt(activeTab)
  );

  return (
    <div style={{ position:"absolute", inset:0, background:theme.bg, display:"flex", flexDirection:"column" }}>

      {/* Header — logo left, share + back right */}
      <div style={{ height:64, padding:"0 16px", borderBottom:`1px solid ${theme.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:`${theme.bg}F4`, backdropFilter:"blur(14px)" }}>
        {/* Logo — click to home */}
        <div onClick={onGoHome || onClose} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <LogoMark size={28}/>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
              <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:18, color:theme.text, letterSpacing:"-0.5px" }}>sondal</span>
              <span style={{ fontFamily:"Inter, sans-serif", fontWeight:500, fontSize:12, color:theme.accent }}>.top</span>
            </div>
            <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:8, margin:0, letterSpacing:"0.06em", textTransform:"uppercase" }}>Sonda to argument.</p>
          </div>
        </div>
        {/* Right — share + back */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", alignItems:"center" }}>
            <Share2 size={18} color={theme.textMuted} strokeWidth={1.8}/>
          </button>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", alignItems:"center" }}>
            <ChevronRight size={22} strokeWidth={2} color={theme.textMuted}/>
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", minHeight:0 }}>

        {/* Poll card */}
        <div style={{ padding:"14px 16px 18px", borderBottom:`1px solid ${theme.border}` }}>
          {/* Tag row — below header */}
          <div style={{ marginBottom:12 }}>
            <Tag>{poll.tag}</Tag>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:theme.indigo, border:`1px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:theme.accent, fontWeight:700, flexShrink:0 }}>{poll.avatar}</div>
            <div>
              <span style={{ color:theme.text, fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:600 }}>{poll.user}</span>
              <span style={{ color:theme.textDim, fontSize:11, fontFamily:"Inter, sans-serif", marginLeft:6 }}>{poll.time}</span>
            </div>
          </div>

          <h2 style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:18, fontWeight:700, lineHeight:1.4, margin:"0 0 16px" }}>{poll.question}</h2>

          {/* Vote or results */}
          {voted === null ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {poll.options.map((opt,i) => (
                <button key={i} onClick={() => setVoted(i)}
                  style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:10, padding:"13px 16px", color:theme.text, fontFamily:"Inter, sans-serif", fontSize:14, textAlign:"left", cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=theme.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}
                >{opt}</button>
              ))}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {poll.options.map((opt,i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ color: i===voted ? theme.accentBright : theme.textMuted, fontSize:13, fontFamily:"Inter, sans-serif", fontWeight: i===voted ? 600 : 400 }}>{opt} {i===voted && "✓"}</span>
                    <span style={{ color:theme.textMuted, fontSize:13, fontFamily:"Inter, sans-serif", fontWeight:700 }}>{poll.split[i]}%</span>
                  </div>
                  <div style={{ height:8, background:theme.border, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ width:`${poll.split[i]}%`, height:"100%", background: i===voted ? theme.accent : theme.textDim, borderRadius:4, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              ))}
              <p style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif", marginTop:4 }}>{poll.totalVotes.toLocaleString()} głosów łącznie</p>
            </div>
          )}
        </div>

        {/* Discussion */}
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:14, background:theme.accent, borderRadius:2 }}/>
            <span style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700 }}>Dyskusja</span>
            <span style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif" }}>({poll.comments.length})</span>
          </div>

          {/* Filter tabs — by vote */}
          {voted !== null && (
            <div style={{ display:"flex", gap:7, marginBottom:14, overflowX:"auto", scrollbarWidth:"none" }}>
              {[
                { key:"all", label:"Wszystkie" },
                ...poll.options.map((opt,i) => ({ key:String(i), label:opt.split(" ")[0]+"…" }))
              ].map(tab => (
                <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{ background: activeTab===tab.key ? theme.accent : theme.surface, color: activeTab===tab.key ? "#fff" : theme.textMuted, border:"none", borderRadius:20, padding:"5px 12px", fontSize:11, fontFamily:"Inter, sans-serif", fontWeight: activeTab===tab.key ? 700 : 400, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{tab.label}</button>
              ))}
            </div>
          )}

          {/* Comments */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:20 }}>
            {filteredComments.map(c => (
              <div key={c.id} style={{ background:theme.surface, borderRadius:12, padding:"12px 14px", border:`1px solid ${theme.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:theme.indigo, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:theme.accent, fontWeight:700, flexShrink:0 }}>{c.user[1].toUpperCase()}</div>
                    <div>
                      <span style={{ color:theme.text, fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:600 }}>{c.user}</span>
                      <span style={{ color:theme.textDim, fontSize:10, fontFamily:"Inter, sans-serif", marginLeft:6 }}>{c.time}</span>
                    </div>
                  </div>
                  {/* Vote badge */}
                  <span style={{ background: c.vote === 0 ? `${theme.accent}20` : `${theme.red}15`, color: c.vote === 0 ? theme.accent : theme.red, fontSize:9, fontFamily:"Inter, sans-serif", fontWeight:700, padding:"2px 7px", borderRadius:4, flexShrink:0, letterSpacing:"0.04em" }}>
                    {poll.options[c.vote]?.split(" ")[0]}
                  </span>
                </div>
                <p style={{ color:theme.text, fontFamily:"Inter, sans-serif", fontSize:13, lineHeight:1.55, margin:0 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div style={{ padding:"10px 16px 16px", borderTop:`1px solid ${theme.border}`, background:theme.bg, display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ flex:1, background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:20, padding:"10px 14px" }}>
          <span style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:13 }}>Dodaj komentarz…</span>
        </div>
        <button style={{ background:theme.accent, border:"none", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          <ChevronRight size={18} color="#fff" strokeWidth={2.5}/>
        </button>
      </div>
    </div>
  );
}

