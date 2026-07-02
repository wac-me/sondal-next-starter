"use client";

// EmbedPreview — wydzielony z makiety sondal_ekran_glowny.jsx
// TODO: zastąp mockowe dane prawdziwymi propsami / zapytaniami Supabase

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Share2, ChevronRight, User, Lock, Eye, Plus, BarChart2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark, Tag, VoteButtons, MiniBarChart, EmptyState, SkeletonCard, Toggle } from "@/components/ui";

// Dane mockowe (inline) — przenieś do propsów lub pobierz z Supabase
// gdy będziesz podłączać konkretny ekran do bazy danych.

export function EmbedPreview({ onClose }) {
  return (
    <div style={{ position:"absolute", inset:0, zIndex:900, background:"#f1f3f5", overflowY:"auto" }}>
      {/* Fake external site header — pokazuje kontekst osadzenia */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e4e7", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"Georgia, serif", fontSize:18, fontWeight:700, color:"#1a1a1a" }}>Blog Mieszkańca</span>
        <button onClick={onClose} style={{ background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontFamily:"Inter, sans-serif", fontSize:12, cursor:"pointer" }}>Zamknij podgląd</button>
      </div>

      {/* Fake article content around the embed */}
      <div style={{ padding:"24px 18px", maxWidth:480, margin:"0 auto" }}>
        <p style={{ color:"#666", fontFamily:"Georgia, serif", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Urbanistyka • 3 min czytania</p>
        <h1 style={{ color:"#1a1a1a", fontFamily:"Georgia, serif", fontSize:24, fontWeight:700, lineHeight:1.3, marginBottom:14 }}>Czy nasze rondo naprawdę potrzebuje przejść naziemnych?</h1>
        <p style={{ color:"#333", fontFamily:"Georgia, serif", fontSize:15, lineHeight:1.7, marginBottom:16 }}>
          Temat wraca co kilka miesięcy przy okazji kolejnego wypadku. Urzędnicy mówią o "analizie", mieszkańcy o zdrowym rozsądku.
          Postanowiłem sprawdzić, co na ten temat sądzi społeczność — wstawiłem sondę z portalu sondal.top bezpośrednio w tym artykule:
        </p>

        {/* ── Actual embed widget rendered inline ── */}
        <div style={{ margin:"20px 0" }}>
          <EmbedWidget/>
        </div>

        <p style={{ color:"#333", fontFamily:"Georgia, serif", fontSize:15, lineHeight:1.7, marginTop:16 }}>
          Wyniki będą aktualizować się na żywo — możesz wrócić do tego artykułu za tydzień i zobaczyć jak zmieniło się zdanie czytelników.
        </p>

        <div style={{ marginTop:24, padding:"14px 16px", background:"#fff", border:"1px solid #e2e4e7", borderRadius:10 }}>
          <p style={{ color:"#888", fontFamily:"Inter, sans-serif", fontSize:11, lineHeight:1.6, margin:0 }}>
            💡 To jest podgląd jak wygląda kod &lt;iframe&gt; osadzony na zewnętrznej stronie — np. blogu, w artykule prasowym, albo na stronie szkoły. Widget dziedziczy własny styl niezależnie od strony hosta.
          </p>
        </div>
      </div>
    </div>
  );
}


