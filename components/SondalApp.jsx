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
    },
    2: {
      id: 2,
      tag: "#technologia",
      avatar: "K",
      user: "Krzysztof",
      time: "3h temu",
      question: "Czy AI zastąpi programistów?",
      options: ["Tak, całkowicie", "Częściowo", "Nie, nigdy"],
      split: [40, 45, 15],
      totalVotes: 890,
      comments: []
    },
    3: {
      id: 3,
      tag: "#społeczeństwo",
      avatar: "A",
      user: "Anna",
      time: "5h temu",
      question: "Czy należy znieść wizy do UE?",
      options: ["Tak", "Nie", "Tylko dla niektórych"],
      split: [60, 30, 10],
      totalVotes: 756,
      comments: []
    },
    4: {
      id: 4,
      tag: "#gospodarka",
      avatar: "P",
      user: "Piotr",
      time: "1d temu",
      question: "Czy podnieść minimalną wynagrodzenie?",
      options: ["Tak, znacząco", "Tak, nieznacznie", "Nie"],
      split: [50, 35, 15],
      totalVotes: 543,
      comments: []
    },
    5: {
      id: 5,
      tag: "#zdrowie",
      avatar: "E",
      user: "Ewa",
      time: "1d temu",
      question: "Czy szczepienia powinny być obowiązkowe?",
      options: ["Tak, wszystkie", "Tylko niektóre", "Nie"],
      split: [35, 40, 25],
      totalVotes: 432,
      comments: []
    },
    6: {
      id: 6,
      tag: "#edukacja",
      avatar: "T",
      user: "Tomasz",
      time: "2d temu",
      question: "Czy usunąć lektury ze szkół?",
      options: ["Tak, wszystkie", "Częściowo", "Nie"],
      split: [25, 30, 45],
      totalVotes: 321,
      comments: []
    },
    7: {
      id: 7,
      tag: "#środowisko",
      avatar: "M",
      user: "Monika",
      time: "2d temu",
      question: "Czy zakazać plastikowych torebek?",
      options: ["Tak", "Nie", "Opłata"],
      split: [55, 25, 20],
      totalVotes: 287,
      comments: []
    },
    8: {
      id: 8,
      tag: "#sport",
      avatar: "R",
      user: "Robert",
      time: "3d temu",
      question: "Czy Polska zorganizuje olimpiadę?",
      options: ["Tak", "Nie", "Może"],
      split: [30, 50, 20],
      totalVotes: 198,
      comments: []
    },
    9: {
      id: 9,
      tag: "#kultura",
      avatar: "J",
      user: "Joanna",
      time: "4d temu",
      question: "Czy finansować filmy narodowe?",
      options: ["Tak", "Nie", "Częściowo"],
      split: [40, 35, 25],
      totalVotes: 156,
      comments: []
    },
    10: {
      id: 10,
      tag: "#transport",
      avatar: "S",
      user: "Stanisław",
      time: "5d temu",
      question: "Czy darmowa komunikacja miejska?",
      options: ["Tak", "Nie", "Dla seniorów"],
      split: [45, 30, 25],
      totalVotes: 134,
      comments: []
    },
    11: {
      id: 11,
      tag: "#energetyka",
      avatar: "W",
      user: "Wojciech",
      time: "6d temu",
      question: "Czy zainwestować w atom?",
      options: ["Tak", "Nie", "OZE"],
      split: [50, 25, 25],
      totalVotes: 112,
      comments: []
    },
    12: {
      id: 12,
      tag: "#media",
      avatar: "Z",
      user: "Zuzanna",
      time: "1w temu",
      question: "Czy regulować media społecznościowe?",
      options: ["Tak", "Nie", "Samoregulacja"],
      split: [35, 40, 25],
      totalVotes: 98,
      comments: []
    }
  };

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
  const goHome             = () => {
    setActiveNav("discover");
    setShowTrending(false);
    setTrendingDetailId(null);
    setTrendingDetailAnim("closed");
    setShowSharedPoll(false);
    setShowEmbedPreview(false);
    setCreatorOpen(false);
    setCreatorAnim("closed");
  };

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
            onGoHome={goHome}
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
            <TrendingNowScreen onBack={() => setShowTrending(false)} onGoHome={goHome} onPollOpen={openTrendingDetail} />
          </div>
          <BottomNav active={activeNav} setActive={(id) => { setShowTrending(false); handleNavChange(id); }} />
          {trendingDetailId !== null && trendingPollDetails[trendingDetailId] && (
            <div style={{ position: "absolute", inset: 0, zIndex: 50, transform: trendingDetailAnim === "open" ? "translateX(0)" : "translateX(100%)", transition: (trendingDetailAnim === "open" || trendingDetailAnim === "closing") ? "transform 0.38s cubic-bezier(.22,.68,0,1.1)" : "none" }}>
              <SondaDetail poll={trendingPollDetails[trendingDetailId]} onClose={closeTrendingDetail} onGoHome={goHome} />
            </div>
          )}
        </div>
      )}

      {/* ── Creator Sheet ── */}
      {creatorOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 500, background: theme.bg, display: "flex", flexDirection: "column", transform: `translateY(${sheetY})`, transition: "transform 0.4s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {creatorStep === "form" && <CreatorScreen onSuccess={handleSuccess} onClose={closeCreator} onGoHome={goHome} />}
            {creatorStep === "success" && (
              <SuccessScreen
                pollData={pollData}
                onReset={handleReset}
                onGoToDiscover={handleGoToDiscover}
                onGoHome={goHome}
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
          <SharedPollScreen onGoToPortal={goHome} />
        </div>
      )}

      {/* ── Embed Preview ── */}
      {showEmbedPreview && <EmbedPreview onClose={() => setShowEmbedPreview(false)} />}
    </div>
  );
}
