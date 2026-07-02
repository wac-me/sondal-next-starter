"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark } from "@/components/ui";

// ─── NOW! animated badge ──────────────────────────────────
function NowBadge() {
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    let t;
    const cycle = () => {
      setShowText(true);
      t = setTimeout(() => {
        setShowText(false);
        t = setTimeout(cycle, 12500);
      }, 3000);
    };
    cycle();
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: showText ? 5 : 0,
      background: theme.redDim,
      borderRadius: 20,
      paddingTop: 5, paddingBottom: 5,
      paddingLeft: showText ? 10 : 6,
      paddingRight: showText ? 10 : 6,
      overflow: "hidden",
      transition: "padding 0.5s cubic-bezier(.4,0,.2,1), gap 0.5s cubic-bezier(.4,0,.2,1)",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.red, display: "block", flexShrink: 0, animation: "pulsered 1.6s infinite" }} />
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
        fontSize: 11, color: theme.red, letterSpacing: "0.08em",
        maxWidth: showText ? 40 : 0,
        opacity: showText ? 1 : 0,
        overflow: "hidden", whiteSpace: "nowrap",
        transition: "max-width 0.5s cubic-bezier(.4,0,.2,1), opacity 0.35s ease",
      }}>NOW!</span>
    </div>
  );
}

// ─── Sticky Header ────────────────────────────────────────
// nowActive   — pokazuje NOW! badge (tylko na ekranie głównym)
// onShowTrending — kliknięcie NOW! otwiera Trending screen
// onGoHome    — kliknięcie logo wraca do strony głównej
export function StickyHeader({ nowActive, onShowTrending, onGoHome }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerHeight = 64;

  useEffect(() => {
    const el = document.querySelector("[data-scroll-feed]");
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y > lastScrollY.current + 6 && y > headerHeight) setHidden(true);
      else if (y < lastScrollY.current - 4) setHidden(false);
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 200,
      background: `${theme.bg}F4`, backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${theme.border}`,
      height: headerHeight,
      display: "flex", alignItems: "center",
      padding: "0 16px",
      transform: hidden ? "translateY(-100%)" : "translateY(0)",
      transition: "transform 0.32s cubic-bezier(.4,0,.2,1)",
    }}>
      {/* Logo — klikalny, wraca do home */}
      <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: onGoHome ? "pointer" : "default" }}>
        <LogoMark size={28} />
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: theme.text, letterSpacing: "-0.5px" }}>sondal</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: theme.accent }}>.top</span>
          </div>
          <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 8, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Sonda to argument.</p>
        </div>
      </div>

      {/* Lupa + NOW! badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 6 }}>
          <Search size={18} color={theme.textMuted} strokeWidth={1.8} />
        </button>
        {nowActive && (
          <div onClick={onShowTrending} style={{ cursor: "pointer" }}>
            <NowBadge />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Creator / Detail header (logo + akcja po prawej) ─────
// Używany w: CreatorScreen, SondaDetail, TrendingNowScreen
export function SimpleHeader({ onGoHome, rightElement }) {
  return (
    <div style={{
      height: 64, padding: "0 16px",
      borderBottom: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0, background: `${theme.bg}F4`, backdropFilter: "blur(14px)",
    }}>
      <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <LogoMark size={28} />
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: theme.text, letterSpacing: "-0.5px" }}>sondal</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: theme.accent }}>.top</span>
          </div>
          <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 8, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Sonda to argument.</p>
        </div>
      </div>
      {rightElement}
    </div>
  );
}
