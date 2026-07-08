"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart2, ChevronRight, MessageCircle, RefreshCw, User } from "lucide-react";
import { theme } from "@/lib/theme";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { EmptyState, SkeletonCard, Tag } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { getDiscussionThreads } from "@/lib/queries";

const tabs = ["Gorące", "Najnowsze", "Moje"];

function formatRelativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dni temu`;
  return new Date(value).toLocaleDateString("pl-PL");
}

function getAuthor(comment) {
  return comment.profiles?.handle || "Anonim";
}

function getAvatar(comment) {
  return comment.profiles?.avatar_letter || "?";
}

function ThreadCard({ thread, hot, onOpen }) {
  const lastComment = thread.comments[0];
  return (
    <button
      onClick={onOpen}
      style={{ width:"100%", background:theme.surface, borderRadius:14, padding:"14px", marginBottom:10, border:`1px solid ${hot ? theme.redBorder : theme.border}`, cursor:"pointer", textAlign:"left" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = hot ? theme.redBorder : theme.borderAccent}
      onMouseLeave={e => e.currentTarget.style.borderColor = hot ? theme.redBorder : theme.border}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:9 }}>
        <Tag hot={hot}>{thread.poll.category || "#Sonda"}</Tag>
        <span style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, flexShrink:0 }}>{formatRelativeTime(thread.lastCommentAt)}</span>
      </div>

      <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700, lineHeight:1.4, margin:"0 0 9px" }}>
        {thread.poll.question}
      </p>

      <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:12, lineHeight:1.45, margin:"0 0 12px" }}>
        {lastComment.content}
      </p>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", gap:14, alignItems:"center", minWidth:0 }}>
          <span style={{ color:theme.textMuted, fontSize:12, fontFamily:"Inter, sans-serif", display:"flex", alignItems:"center", gap:5 }}>
            <MessageCircle size={13} strokeWidth={1.8}/> {thread.commentCount}
          </span>
          <span style={{ color:theme.textDim, fontSize:12, fontFamily:"Inter, sans-serif", display:"flex", alignItems:"center", gap:5, minWidth:0 }}>
            <User size={13} strokeWidth={1.8}/> {getAuthor(lastComment)}
          </span>
        </div>
        <ChevronRight size={18} color={theme.accent} strokeWidth={1.8}/>
      </div>
    </button>
  );
}

function DiscussionDetail({ thread, onBack }) {
  const openPoll = () => {
    window.location.href = `/x/${thread.poll.slug}`;
  };

  return (
    <div style={{ position:"absolute", inset:0, zIndex:320, background:theme.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ height:64, padding:"0 16px", borderBottom:`1px solid ${theme.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:`${theme.bg}F4`, backdropFilter:"blur(14px)" }}>
        <div>
          <p style={{ color:theme.accent, fontFamily:"Inter, sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 4px" }}>Dyskusja</p>
          <p style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:800, margin:0 }}>Wątek sondy</p>
        </div>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", alignItems:"center" }}>
          <ChevronRight size={22} strokeWidth={2} color={theme.textMuted}/>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 0", WebkitOverflowScrolling:"touch", minHeight:0 }}>
        <div style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:14, padding:"16px", marginBottom:14 }}>
          <Tag>{thread.poll.category || "#Sonda"}</Tag>
          <h2 style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:18, fontWeight:800, lineHeight:1.35, margin:"12px 0 14px" }}>{thread.poll.question}</h2>
          <button onClick={openPoll} style={{ width:"100%", background:theme.bg, border:`1px solid ${theme.border}`, borderRadius:10, padding:"11px", color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <BarChart2 size={15} strokeWidth={1.8}/> Otwórz sondę
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"0 0 12px" }}>
          <div style={{ width:3, height:14, background:theme.accent, borderRadius:2 }}/>
          <span style={{ color:theme.text, fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700 }}>Komentarze</span>
          <span style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:12 }}>({thread.commentCount})</span>
        </div>

        {thread.comments.map(comment => (
          <div key={comment.id} style={{ background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:12, padding:"13px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:theme.indigo, border:`1px solid ${theme.borderAccent}`, display:"flex", alignItems:"center", justifyContent:"center", color:theme.accentBright, fontSize:12, fontWeight:800, flexShrink:0 }}>
                {getAvatar(comment)}
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ color:theme.text, fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:700, margin:0 }}>{getAuthor(comment)}</p>
                <p style={{ color:theme.textDim, fontFamily:"Inter, sans-serif", fontSize:11, margin:0 }}>{formatRelativeTime(comment.created_at)}</p>
              </div>
            </div>
            <p style={{ color:theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, lineHeight:1.55, margin:0 }}>{comment.content}</p>
          </div>
        ))}

        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

export function DiscussScreen({ onGoHome }) {
  const [activeTab, setActiveTab] = useState("Gorące");
  const [threads, setThreads] = useState([]);
  const [myThreads, setMyThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const supabase = useMemo(() => createClient(), []);

  const loadThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser || null);

      const all = await getDiscussionThreads(supabase, { limit: 120 });
      setThreads(all);

      if (currentUser) {
        const mine = await getDiscussionThreads(supabase, { limit: 80, authorId: currentUser.id });
        setMyThreads(mine);
      } else {
        setMyThreads([]);
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać dyskusji.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const visibleThreads = useMemo(() => {
    const source = activeTab === "Moje" ? myThreads : threads;
    const sorted = [...source];

    if (activeTab === "Gorące") {
      sorted.sort((a, b) => {
        if (b.commentCount !== a.commentCount) return b.commentCount - a.commentCount;
        return new Date(b.lastCommentAt).getTime() - new Date(a.lastCommentAt).getTime();
      });
      return sorted;
    }

    sorted.sort((a, b) => new Date(b.lastCommentAt).getTime() - new Date(a.lastCommentAt).getTime());
    return sorted;
  }, [activeTab, myThreads, threads]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, overflow:"hidden", position:"relative" }}>
      <StickyHeader nowActive={false} onGoHome={onGoHome}/>
      <div style={{ flex:1, overflowY:"auto", paddingTop:64, WebkitOverflowScrolling:"touch", minHeight:0 }}>

        <div style={{ display:"flex", borderBottom:`1px solid ${theme.border}`, padding:"0 16px" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:"none", border:"none", borderBottom: activeTab === tab ? `2px solid ${theme.accent}` : "2px solid transparent", padding:"12px 16px", color: activeTab === tab ? theme.accent : theme.textMuted, fontFamily:"Inter, sans-serif", fontSize:13, fontWeight: activeTab === tab ? 700 : 400, cursor:"pointer", transition:"all 0.15s" }}>{tab}</button>
          ))}
        </div>

        <div style={{ padding:"12px 12px 0" }}>
          {error && (
            <div style={{ background:theme.redDim, border:`1px solid ${theme.redBorder}`, borderRadius:12, padding:"13px", marginBottom:12 }}>
              <p style={{ color:theme.red, fontFamily:"Inter, sans-serif", fontSize:13, margin:"0 0 10px" }}>{error}</p>
              <button onClick={loadThreads} style={{ background:"none", border:`1px solid ${theme.redBorder}`, borderRadius:9, padding:"8px 12px", color:theme.red, fontFamily:"Inter, sans-serif", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <RefreshCw size={13} strokeWidth={1.8}/> Spróbuj ponownie
              </button>
            </div>
          )}

          {loading ? (
            <>
              <SkeletonCard/>
              <SkeletonCard/>
              <SkeletonCard/>
            </>
          ) : activeTab === "Moje" && !user ? (
            <EmptyState
              icon={<MessageCircle size={28} color={theme.accent} strokeWidth={1.5}/>}
              title="Zaloguj się do swoich dyskusji"
              subtitle="Tu pokażą się wątki, w których zostawisz komentarz po zalogowaniu."
            />
          ) : visibleThreads.length === 0 ? (
            <EmptyState
              icon={<MessageCircle size={28} color={theme.accent} strokeWidth={1.5}/>}
              title="Nie ma jeszcze dyskusji"
              subtitle="Gdy pod sondami pojawią się komentarze, zbudujemy z nich wątki tutaj."
            />
          ) : (
            visibleThreads.map((thread, index) => (
              <ThreadCard
                key={thread.poll.id}
                thread={thread}
                hot={activeTab === "Gorące" && index < 3 && thread.commentCount > 1}
                onOpen={() => setSelectedThread(thread)}
              />
            ))
          )}

          <div style={{ height:20 }}/>
        </div>
      </div>

      {selectedThread && (
        <DiscussionDetail thread={selectedThread} onBack={() => setSelectedThread(null)} />
      )}
    </div>
  );
}
