"use client";

import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/client";

import { DiscoverScreen }    from "@/components/screens/DiscoverScreen";
import { DiscussScreen }     from "@/components/screens/DiscussScreen";
import { LoginScreen }       from "@/components/screens/LoginScreen";
import { ProfileScreen }     from "@/components/screens/ProfileScreen";
import { CreatorScreen }     from "@/components/screens/CreatorScreen";
import { SuccessScreen }     from "@/components/screens/SuccessScreen";
import { TrendingNowScreen } from "@/components/screens/TrendingNowScreen";
import { SondaDetail }       from "@/components/screens/SondaDetail";
import { SharedPollScreen }  from "@/components/screens/SharedPollScreen";
import { EmbedPreview }      from "@/components/screens/EmbedPreview";

export function SondalApp({ communityPolls: initialPolls = [], editorialPolls = [] }) {
  const [activeNav,        setActiveNav]        = useState("discover");
  const [creatorStep,      setCreatorStep]      = useState("form");
  const [pollData,         setPollData]         = useState(null);
  const [creatorOpen,      setCreatorOpen]      = useState(false);
  const [creatorAnim,      setCreatorAnim]      = useState("closed");
  const [showTrending,     setShowTrending]     = useState(false);
  const [showSharedPoll,   setShowSharedPoll]   = useState(false);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);
  const [trendingDetailId,   setTrendingDetailId]   = useState(null);
  const [trendingDetailAnim, setTrendingDetailAnim] = useState("closed");

  // ── Sesja i lista sond ──────────────────────────────────
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);
  const [sessionChecked,  setSessionChecked]  = useState(false); // czy już sprawdziliśmy sesję
  const [communityPolls,  setCommunityPolls]  = useState(initialPolls);

  const supabase = createClient();

  // Sprawdź sesję przy starcie — i nasłuchuj zmian (login/logout/odświeżenie)
  useEffect(() => {
    // Pobierz aktualną sesję
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setSessionChecked(true);
    });

    // Nasłuchuj zmian sesji (login, logout, odświeżenie tokenu)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Po dodaniu nowej sondy — dodaj ją optymistycznie do feedu ──
  // Nie czekamy na odświeżenie strony — sonda pojawia się natychmiast
  const handleSuccess = async (data) => {
    setPollData(data);
    setCreatorStep("success");

    // Pobierz prawdziwe opcje z bazy po utworzeniu sondy
    const supabase = createClient();
    let realOptions = [];

    try {
      const { data: options } = await supabase
        .from('poll_options')
        .select('id, label, position')
        .eq('poll_id', data.pollId)
        .order('position');
      realOptions = options || [];
    } catch (err) {
      console.error("Failed to fetch poll options:", err);
      // Fallback do tymczasowych opcji jeśli pobranie się nie uda
      realOptions = (data.options || []).map((label, i) => ({ id: `fallback-${i}`, label, position: i }));
    }

    // Zbuduj mockowy obiekt zgodny ze strukturą z bazy
    const newPoll = {
      id:         data.pollId,
      slug:       data.slug   || "",
      question:   data.question,
      category:   data.category,
      created_at: new Date().toISOString(),
      is_anonymous: data.isAnon,
      profiles:   data.isAnon ? null : { handle: "wac", avatar_letter: "A" }, // null = Anonim
      poll_options: realOptions,
      // Pola pomocnicze dla lokalnego wyświetlania
      totalVotes: 0,
      baseSplit:  Array(data.options?.length || 2).fill(Math.floor(100 / (data.options?.length || 2))),
    };

    setCommunityPolls(prev => [newPoll, ...prev]);
  };

  // ── Trending detail ──────────────────────────────────────
  const openTrendingDetail = (id) => {
    setTrendingDetailId(id);
    setTrendingDetailAnim("entering");
    setTimeout(() => setTrendingDetailAnim("open"), 20);
  };
  const closeTrendingDetail = () => {
    setTrendingDetailAnim("closing");
    setTimeout(() => { setTrendingDetailId(null); setTrendingDetailAnim("closed"); }, 360);
  };

  // ── Creator sheet ────────────────────────────────────────
  const openCreator = () => {
    setCreatorStep("form");
    setCreatorOpen(true);
    setCreatorAnim("opening");
    setTimeout(() => setCreatorAnim("open"), 20);
  };
  const closeCreator = () => {
    setCreatorAnim("closing");
    setTimeout(() => { setCreatorOpen(false); setCreatorAnim("closed"); }, 380);
  };

  const handleNavChange    = (id) => { if (id === "create") { openCreator(); return; } setActiveNav(id); };
  const handleReset        = () => { setPollData(null); setCreatorStep("form"); };
  const handleGoToDiscover = () => { closeCreator(); setActiveNav("discover"); };
  const goHome             = () => { setActiveNav("discover"); setShowTrending(false); };

  const isOpen = creatorAnim === "open" || creatorAnim === "opening";
  const sheetY = creatorAnim === "open" ? "0%" : "100%";

  // Nie renderuj zanim nie wiemy czy użytkownik jest zalogowany
  // (unika błysku ekranu logowania dla zalogowanych użytkowników)
  if (!sessionChecked) {
    return (
      <div style={{ background: theme.bg, height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.accent, animation: "pulsered 1.2s infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, height: "100dvh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", overflow: "hidden", position: "relative" }}>

      {/* ── Główne ekrany ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeNav === "discover" && (
          <DiscoverScreen
            communityPolls={communityPolls}
            editorialPolls={editorialPolls}
            onGoToCreate={openCreator}
            onShowTrending={() => setShowTrending(true)}
          />
        )}
        {activeNav === "discuss" && <DiscussScreen onGoHome={goHome} />}
        {activeNav === "account" && (
          isLoggedIn
            ? <ProfileScreen onGoHome={goHome} onLogout={() => setIsLoggedIn(false)} />
            : <LoginScreen   onGoHome={goHome} onLoggedIn={() => setIsLoggedIn(true)} />
        )}
      </div>

      {/* ── Bottom Nav ── */}
      {!showTrending && !creatorOpen && (activeNav !== "account" || isLoggedIn) && (
        <BottomNav active={activeNav} setActive={handleNavChange} />
      )}

      {/* ── Trending NOW ── */}
      {showTrending && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, background: theme.bg, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <TrendingNowScreen onBack={() => setShowTrending(false)} onPollOpen={openTrendingDetail} />
          </div>
          <BottomNav active={activeNav} setActive={(id) => { setShowTrending(false); handleNavChange(id); }} />
          {trendingDetailId !== null && (
            <div style={{ position: "absolute", inset: 0, zIndex: 50, transform: trendingDetailAnim === "open" ? "translateX(0)" : "translateX(100%)", transition: (trendingDetailAnim === "open" || trendingDetailAnim === "closing") ? "transform 0.38s cubic-bezier(.22,.68,0,1.1)" : "none" }}>
              <SondaDetail pollId={trendingDetailId} onClose={closeTrendingDetail} />
            </div>
          )}
        </div>
      )}

      {/* ── Creator Sheet ── */}
      {creatorOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 500, background: theme.bg, display: "flex", flexDirection: "column", transform: `translateY(${sheetY})`, transition: "transform 0.4s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {creatorStep === "form" && <CreatorScreen onSuccess={handleSuccess} onClose={closeCreator} />}
            {creatorStep === "success" && (
              <SuccessScreen
                pollData={pollData}
                onReset={handleReset}
                onGoToDiscover={handleGoToDiscover}
                onPreviewShared={() => setShowSharedPoll(true)}
                onPreviewEmbed={() => setShowEmbedPreview(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Shared Poll ── */}
      {showSharedPoll && (
        <div style={{ position: "absolute", inset: 0, zIndex: 900 }}>
          <SharedPollScreen onGoToPortal={() => { setShowSharedPoll(false); setCreatorOpen(false); setCreatorAnim("closed"); setActiveNav("discover"); }} />
        </div>
      )}

      {/* ── Embed Preview ── */}
      {showEmbedPreview && <EmbedPreview onClose={() => setShowEmbedPreview(false)} />}
    </div>
  );
}
