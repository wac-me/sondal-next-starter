"use client";

import { BarChart2, Plus, MessageCircle, User } from "lucide-react";
import { theme } from "@/lib/theme";

export function BottomNav({ active, setActive }) {
  const items = [
    { id: "discover", icon: <BarChart2 size={20} strokeWidth={1.8} />, label: "Odkrywaj" },
    { id: "create",   icon: <Plus size={22} strokeWidth={2.5} />,      label: "Utwórz", main: true },
    { id: "discuss",  icon: <MessageCircle size={20} strokeWidth={1.8} />, label: "Dyskusje" },
    { id: "account",  icon: <User size={20} strokeWidth={1.8} />,      label: "Konto" },
  ];

  return (
    <div style={{
      position: "sticky", bottom: 0,
      background: `${theme.surface}F5`, backdropFilter: "blur(12px)",
      borderTop: `1px solid ${theme.border}`,
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 14px", zIndex: 100, flexShrink: 0,
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)} style={{
          background: item.main ? theme.accent : "transparent",
          border: "none", borderRadius: item.main ? 12 : 0,
          padding: item.main ? "8px 20px" : "4px 12px",
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <div style={{ color: item.main ? "#fff" : (active === item.id ? theme.accent : theme.textDim), display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            {item.icon}
          </div>
          <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", color: item.main ? "#fff" : (active === item.id ? theme.accent : theme.textDim), fontWeight: item.main ? 700 : (active === item.id ? 600 : 400) }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
