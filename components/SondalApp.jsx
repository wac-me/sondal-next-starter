"use client";

// ─── Root aplikacji — zarządza całą nawigacją i stanem ekranów ──
// Ten komponent jest "use client" bo obsługuje animacje i stan UI.
// Dane do ekranów pobierane są w app/page.js (Server Component) i przekazywane jako props.

import { useState } from "react";
import { theme } from "@/lib/theme";
import { BottomNav } from "@/components/layout/BottomNav";

// Ekrany — importowane leniwie żeby każdy był osobnym plikiem
import { DiscoverScreen } from "@/components/screens/DiscoverScreen";
import { DiscussScreen }  from "@/components/screens/DiscussScreen";
import { LoginScreen }    from "@/components/screens/LoginScreen";
import { ProfileScreen }  from "@/components/screens/ProfileScreen";
import { CreatorScreen }  from "@/components/screens/CreatorScreen";
import { SuccessScreen }  from "@/components/screens/SuccessScreen";
import { TrendingNowScreen } from "@/components/screens/TrendingNowScreen";
import { SondaDetail }    from "@/components/screens/SondaDetail";
import { SharedPollScreen } from "@/components/screens/SharedPollScreen";
import { EmbedPreview }   from "@/components/screens/EmbedPreview";

export function SondalApp({ communityPolls = [], editorialPolls = [] }) {
  const [activeNav,      setActiveNav]      = useState("discover");
  const [creatorStep,    setCreatorStep]    = useState("form");
  const [pollData,       setPollData]       = useState(null);
  const [creatorOpen,    setCreatorOpen]    = useState(false);
  const [creatorAnim,    setCreatorAnim]    = useState("closed");
  const [showTrending,   setShowTrending]   = useState(false);
  const [showSharedPoll, setShowSharedPoll] = useState(false);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [trendingDetailId,   setTrendingDetailId]   = useState(null);
  const [trendingDetailAnim, setTrendingDetailAnim] = useState("closed");

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

  // ── Creator sheet (wjeżdża z dołu) ──────────────────────
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

  const handleNavChange = (id) => {
    if (id === "create") { openCreator(); return; }
    setActiveNav(id);
  };
  const handleSuccess      = data => { setPollData(data); setCreatorStep("success"); };
  const handleReset        = () => { setPollData(null); setCreatorStep("form"); };
  const handleGoToDiscover = () => { closeCreator(); setActiveNav("discover"); };

  const isOpen = creatorAnim === "open" || creatorAnim === "opening";
  const sheetY = creatorAnim === "open" ? "0%" : "100%";

  const goHome = () => { setActiveNav("discover"); setShowTrending(false); };

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
            : <LoginScreen onGoHome={goHome} onLoggedIn={() => setIsLoggedIn(true)} />
        )}
      </div>

      {/* ── Bottom Nav ── */}
      {!showTrending && !creatorOpen && (activeNav !== "account" || isLoggedIn) && (
        <BottomNav active={activeNav} setActive={handleNavChange} />
      )}

      {/* ── Trending NOW — pełny ekran overlay ── */}
      {showTrending && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, background: theme.bg, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <TrendingNowScreen onBack={() => setShowTrending(false)} onPollOpen={openTrendingDetail} />
          </div>
          <BottomNav active={activeNav} setActive={(id) => { setShowTrending(false); handleNavChange(id); }} />

          {/* Sonda Detail nad Trending — slide z prawej */}
          {trendingDetailId !== null && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              transform: trendingDetailAnim === "open" ? "translateX(0)" : "translateX(100%)",
              transition: (trendingDetailAnim === "open" || trendingDetailAnim === "closing") ? "transform 0.38s cubic-bezier(.22,.68,0,1.1)" : "none",
            }}>
              <SondaDetail pollId={trendingDetailId} onClose={closeTrendingDetail} />
            </div>
          )}
        </div>
      )}

      {/* ── Creator Sheet — wjeżdża z dołu ── */}
      {creatorOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 500,
          background: theme.bg, display: "flex", flexDirection: "column",
          transform: `translateY(${sheetY})`,
          transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
        }}>
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

      {/* ── Shared Poll (demo) ── */}
      {showSharedPoll && (
        <div style={{ position: "absolute", inset: 0, zIndex: 900 }}>
          <SharedPollScreen onGoToPortal={() => { setShowSharedPoll(false); setCreatorOpen(false); setCreatorAnim("closed"); setActiveNav("discover"); }} />
        </div>
      )}

      {/* ── Embed Preview (demo) ── */}
      {showEmbedPreview && (
        <EmbedPreview onClose={() => setShowEmbedPreview(false)} />
      )}
    </div>
  );
}
