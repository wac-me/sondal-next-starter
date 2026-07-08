"use client";

import { useState } from "react";
import { ChevronRight, Eye, Lock } from "lucide-react";
import { theme } from "@/lib/theme";
import { LogoMark, Toggle } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { createPoll } from "@/lib/queries";

export function CreatorScreen({ onSuccess, onClose, onGoHome }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions]   = useState(["", ""]);
  const [isPublic, setIsPublic] = useState(true);
  const [isAnon, setIsAnon]     = useState(true);
  const [category, setCategory] = useState("#Lokalne");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const supabase = createClient();

  const addOption    = () => { if (options.length < 6) setOptions([...options, ""]); };
  const removeOption = i  => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };
  const updateOption = (i, val) => { const o = [...options]; o[i] = val; setOptions(o); };
  const canGenerate  = question.trim().length > 3 && options.filter(o => o.trim()).length >= 2;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    setLoading(true);

    try {
      // Sprawdź czy użytkownik jest zalogowany
      const { data: { user } } = await supabase.auth.getUser();

      const poll = await createPoll(supabase, {
        question,
        options: options.filter(o => o.trim()),
        category,
        isPublic,
        isAnonymous: isAnon,
        authorId: user?.id || null,  // null = sonda bez autora (anonimowa)
      });

      // Przekaż dane do SuccessScreen — zawiera slug dla linku
      onSuccess({
        question,
        options: options.filter(o => o.trim()),
        isPublic,
        isAnon,
        category,
        slug: poll.slug,  // np. "abc123"
        pollId: poll.id,
      });

    } catch (err) {
      setError(err.message || "Błąd podczas tworzenia sondy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ height: 64, padding: "0 16px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: `${theme.bg}F4`, backdropFilter: "blur(14px)" }}>
        <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 8, cursor: onGoHome ? "pointer" : "default" }}>
          <LogoMark size={28} />
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: theme.text, letterSpacing: "-0.5px" }}>sondal</span>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 12, color: theme.accent }}>.top</span>
            </div>
            <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 8, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Sonda to argument.</p>
          </div>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, color: theme.accent, letterSpacing: "0.1em" }}>KREATOR</span>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <ChevronRight size={24} strokeWidth={2} color={theme.textMuted} style={{ transform: "rotate(90deg)" }} />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0", WebkitOverflowScrolling: "touch", minHeight: 0 }}>

        {error && (
          <div style={{ background: theme.redDim, border: `1px solid ${theme.redBorder}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ color: theme.red, fontFamily: "Inter, sans-serif", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Pytanie</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="O co chcesz zapytać?" rows={3}
            style={{ width: "100%", background: theme.surface, border: `1.5px solid ${question.trim() ? theme.accent : theme.border}`, borderRadius: 12, padding: "13px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.5, resize: "none", outline: "none" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Opcje odpowiedzi</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: theme.accentDim, border: `1px solid ${theme.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: theme.accent, fontSize: 10, fontWeight: 700 }}>{String.fromCharCode(65 + i)}</span>
                </div>
                <input value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Opcja ${String.fromCharCode(65 + i)}`}
                  style={{ flex: 1, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "11px 12px", color: theme.text, fontFamily: "Inter, sans-serif", fontSize: 14, outline: "none" }} />
                {options.length > 2 && <button onClick={() => removeOption(i)} style={{ background: "none", border: "none", color: theme.textDim, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>×</button>}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button onClick={addOption} style={{ background: "none", border: `1px dashed ${theme.border}`, borderRadius: 9, padding: "10px", width: "100%", color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer", marginTop: 8 }}>
              + Dodaj opcję
            </button>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: theme.textMuted, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Kategoria</label>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {["#Lokalne", "#Gospodarka", "#Rozrywka", "#Edukacja", "#Sport"].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ background: category === cat ? theme.accent : theme.surface, color: category === cat ? "#fff" : theme.textMuted, border: `1px solid ${category === cat ? "transparent" : theme.border}`, borderRadius: 20, padding: "6px 12px", fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: category === cat ? 700 : 400, cursor: "pointer" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Toggle label="Publiczna w portalu" icon={<Eye size={16} color={theme.textMuted} strokeWidth={1.8} />} value={isPublic} onChange={setIsPublic} />
          <Toggle label="Anonimowe głosowanie" icon={<Lock size={16} color={theme.textMuted} strokeWidth={1.8} />} value={isAnon} onChange={setIsAnon} />
        </div>
        <div style={{ height: 80 }} />
      </div>

      {/* Sticky bottom button */}
      <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${theme.border}`, background: theme.bg }}>
        {!canGenerate && <p style={{ color: theme.textDim, fontFamily: "Inter, sans-serif", fontSize: 12, textAlign: "center", margin: "0 0 10px" }}>Wpisz pytanie i co najmniej 2 opcje</p>}
        <button onClick={handleGenerate} disabled={!canGenerate || loading}
          style={{ width: "100%", background: canGenerate ? theme.accent : theme.surface, color: canGenerate ? "#fff" : theme.textDim, border: "none", borderRadius: 12, padding: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, cursor: canGenerate && !loading ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          {loading ? "Zapisywanie…" : "Generuj Sondę ⚡"}
        </button>
      </div>
    </>
  );
}
