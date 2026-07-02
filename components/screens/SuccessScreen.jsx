"use client";

// SuccessScreen — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.

export function SuccessScreen({ pollData, onReset, onGoToDiscover, onPreviewShared, onPreviewEmbed }) {
  const slug = pollData?.slug || `x/${Math.random().toString(36).slice(2, 7)}`;
  const link = `sondal.top/${slug}`;
  const iframe = `<iframe src="https://sondal.top/${slug}/embed" width="100%" height="320" frameborder="0"></iframe>`;
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
      <StickyHeader nowActive={false}/>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px 0", WebkitOverflowScrolling:"touch", minHeight:0 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:theme.accentDim, border:`2px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26 }}>⚡</div>
          <h2 style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:22, fontWeight:800, margin:"0 0 6px" }}>Sonda gotowa!</h2>
          <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:14, margin:0, lineHeight:1.5 }}>Twoja sonda jest aktywna. Udostępnij link lub osadź na stronie.</p>
        </div>
        <div style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"16px", marginBottom:20 }}>
          <Tag>{pollData.category} • PODGLĄD</Tag>
          <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700, margin:"10px 0 12px", lineHeight:1.4 }}>{pollData.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {pollData.options.map((opt,i) => (
              <div key={i} style={{ background:theme.bg, border:`1px solid ${theme.border}`, borderRadius:8, padding:"10px 12px", display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:theme.accentDim, border:`1px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:theme.accent, fontSize:9, fontWeight:700 }}>{String.fromCharCode(65+i)}</span>
                </div>
                <span style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13 }}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
        <CopyField label="Twój link" value={link}/>
        <CopyField label="Kod do osadzenia (iFrame)" value={iframe}/>
        {onPreviewShared && (
          <button onClick={onPreviewShared} style={{ width:"100%", background:"none", border:`1px dashed ${theme.border}`, borderRadius:9, padding:"10px", color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, cursor:"pointer", marginBottom:8 }}>
            👁 Demo: zobacz jak wygląda ten link dla odbiorcy
          </button>
        )}
        {onPreviewEmbed && (
          <button onClick={onPreviewEmbed} style={{ width:"100%", background:"none", border:`1px dashed ${theme.border}`, borderRadius:9, padding:"10px", color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, cursor:"pointer", marginBottom:16 }}>
            🖼 Demo: zobacz jak wygląda osadzony iFrame
          </button>
        )}
        <div style={{ background:`linear-gradient(135deg, ${theme.accentDim}, ${theme.indigoDim})`, border:`1px solid ${theme.borderAccent}`, borderRadius:14, padding:"16px", marginBottom:20 }}>
          <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:14, fontWeight:700, margin:"0 0 6px" }}>Chcesz więcej możliwości?</p>
          <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:12, margin:"0 0 12px", lineHeight:1.5 }}>Zaloguj się, aby śledzić wyniki na żywo, edytować sondę i eksportować dane do CSV.</p>
          <button style={{ background:theme.accent, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>Zarejestruj się za darmo →</button>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          <button onClick={onReset} style={{ flex:1, background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:10, padding:"13px", color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:14, cursor:"pointer" }}>+ Nowa sonda</button>
          <button onClick={onGoToDiscover} style={{ flex:1, background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:10, padding:"13px", color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:14, cursor:"pointer" }}>◎ Portal</button>
        </div>
      </div>
    </div>
  );
}


