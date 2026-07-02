"use client";

// DiscussScreen — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.

export function DiscussScreen({ onGoHome }) {
  const tabs = ["Gorące", "Najnowsze", "Moje"];
  const [activeTab, setActiveTab] = useState("Gorące");
  const threads = [
    { id:1,  tag:"#polityka",    title:"4-dniowy tydzień pracy — za czy przeciw?",                    comments:128, votes:9102,  hot:true,  time:"2 godz. temu" },
    { id:2,  tag:"#warszawa",    title:"Rondo przy Dworcu — piesi vs kierowcy. Kto ma rację?",        comments:64,  votes:2341,  hot:true,  time:"3 godz. temu" },
    { id:3,  tag:"#geopolityka", title:"Ormuz — czy grozi nam kryzys paliwowy?",                      comments:44,  votes:9310,  hot:true,  time:"1 godz. temu" },
    { id:4,  tag:"#technologia", title:"AI w miejscu pracy — strach czy szansa?",                     comments:87,  votes:6780,  hot:false, time:"5 godz. temu" },
    { id:5,  tag:"#gospodarka",  title:"Ceny mieszkań — kiedy pęknie bańka?",                         comments:203, votes:4102,  hot:false, time:"8 godz. temu" },
    { id:6,  tag:"#edukacja",    title:"Zadania domowe w podstawówce — za czy przeciw?",              comments:91,  votes:5203,  hot:false, time:"6 godz. temu" },
    { id:7,  tag:"#finanse",     title:"Oszczędności — złotówki, euro czy krypto?",                   comments:156, votes:6614,  hot:false, time:"7 godz. temu" },
    { id:8,  tag:"#miasto",      title:"Drogi rowerowe w Twoim mieście — wystarczające?",             comments:38,  votes:3871,  hot:false, time:"9 godz. temu" },
    { id:9,  tag:"#polityka",    title:"Ordery dla ukraińskich żołnierzy — gest solidarności?",       comments:312, votes:12840, hot:true,  time:"dziś" },
    { id:10, tag:"#gospodarka",  title:"Inflacja spada, ale Polacy tego nie czują — dlaczego?",       comments:178, votes:3917,  hot:false, time:"wczoraj" },
    { id:11, tag:"#technologia", title:"OpenAI wyceniony na 300 mld — bańka czy nowa infrastruktura?",comments:267, votes:7654,  hot:false, time:"wczoraj" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden" }}>
      <StickyHeader nowActive={false} onGoHome={onGoHome}/>
      <div style={{ flex:1, overflowY:"auto", paddingTop:64, WebkitOverflowScrolling:"touch", minHeight:0 }}>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${theme.border}`, padding:"0 16px" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{ background:"none", border:"none", borderBottom: activeTab===tab ? `2px solid ${theme.accent}` : "2px solid transparent", padding:"12px 16px", color: activeTab===tab ? theme.accent : theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight: activeTab===tab ? 600 : 400, cursor:"pointer", transition:"all 0.15s" }}>{tab}</button>
          ))}
        </div>

        <div style={{ padding:"12px 12px 0" }}>
          {activeTab === "Moje" ? (
            <EmptyState
              icon={<MessageCircle size={28} color={theme.accent} strokeWidth={1.5}/>}
              title="Nie masz jeszcze dyskusji"
              subtitle="Zagłosuj w sondzie i dodaj komentarz — Twoje wątki pojawią się tutaj."
              actionLabel="Zaloguj się"
              onAction={()=>{}}
            />
          ) : threads.map(t => (
            <div key={t.id} style={{ background:theme.surface, borderRadius:14, padding:"14px", marginBottom:10, border:`1px solid ${t.hot ? theme.redBorder : theme.border}`, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <Tag hot={t.hot}>{t.tag}</Tag>
                <span style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11 }}>{t.time}</span>
              </div>
              <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:600, lineHeight:1.4, margin:"0 0 10px" }}>{t.title}</p>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <span style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif", display:"flex", alignItems:"center", gap:4 }}>
                  <MessageCircle size={13} strokeWidth={1.8}/> {t.comments}
                </span>
                <span style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif" }}>{t.votes.toLocaleString()} głosów</span>
              </div>
            </div>
          ))}
          {activeTab !== "Moje" && <div style={{ background:theme.surface, borderRadius:14, padding:"20px", textAlign:"center", border:`1px dashed ${theme.border}` }}>
            <MessageCircle size={28} color={theme.textDim} strokeWidth={1.5}/>
            <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, margin:"10px 0 14px", lineHeight:1.5 }}>Zaloguj się, aby komentować sondy i brać udział w dyskusjach.</p>
            <button style={{ background:theme.accent, color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>Zaloguj się →</button>
          </div>}
          <div style={{ height:20 }}/>
        </div>
      </div>
    </div>
  );
}


