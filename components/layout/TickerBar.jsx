"use client";

import { useEffect, useRef } from "react";
import { theme } from "@/lib/theme";

// Dane mockowe — w produkcji zastąp API finansowym (np. Stooq, Alpha Vantage)
const TICKER_ITEMS = [
  { label: "USD/PLN", value: "3,942", delta: "+0,012", pos: true },
  { label: "EUR/PLN", value: "4,271", delta: "-0,008", pos: false },
  { label: "GBP/PLN", value: "4,981", delta: "+0,021", pos: true },
  { label: "WIG20",   value: "2 341", delta: "+1,2%",  pos: true },
  { label: "S&P 500", value: "5 487", delta: "+0,4%",  pos: true },
  { label: "DAX",     value: "18 902",delta: "-0,3%",  pos: false },
  { label: "GOLD",    value: "2 318$", delta: "+0,8%", pos: true },
  { label: "BRENT",   value: "83,4$",  delta: "-1,1%", pos: false },
  { label: "BTC",     value: "67 200$",delta: "+2,3%", pos: true },
  { label: "SILVER",  value: "29,1$",  delta: "+0,5%", pos: true },
  { label: "EUR/USD", value: "1,082",  delta: "-0,003",pos: false },
  { label: "COPPER",  value: "4,51$",  delta: "+0,7%", pos: true },
];

export function TickerBar({ items = TICKER_ITEMS }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame, pos = 0;
    const speed = 0.6;
    const step = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    const pause  = () => cancelAnimationFrame(frame);
    const resume = () => { frame = requestAnimationFrame(step); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  const doubled = [...items, ...items]; // podwójne dla płynnej pętli

  return (
    <div style={{ borderBottom: `1px solid ${theme.border}`, background: theme.bg }}>
      <div ref={trackRef} style={{ display: "flex", alignItems: "center", overflowX: "auto", scrollbarWidth: "none", height: 20 }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", flexShrink: 0, height: "100%", borderRight: `1px solid ${theme.border}` }}>
            <span style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{item.label}</span>
            <span style={{ color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{item.value}</span>
            <span style={{ color: item.pos ? theme.green : theme.red, fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>{item.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
