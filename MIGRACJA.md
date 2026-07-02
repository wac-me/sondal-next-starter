# Migracja sondal: Vite → Next.js + Supabase

Instrukcja krok po kroku do wykonania **przy komputerze** (terminal + edytor kodu).

---

## Krok 0 — wymagania

Sprawdź czy masz zainstalowany Node.js (wersja 18+):

```bash
node --version
```

Jeśli nie masz — pobierz z [nodejs.org](https://nodejs.org) (wersja LTS).

---

## Krok 1 — nowe repo dla wersji Next.js

Zostaw stare repo `sondal` (Vite) nietknięte — to bezpieczna kopia zapasowa makiety.

Stwórz nowy folder na dysku, np. `sondal-next`, i skopiuj tam wszystkie pliki z paczki którą dostałeś (`sondal-next-starter/`).

Struktura po skopiowaniu powinna wyglądać tak:

```
sondal-next/
├── app/
│   ├── layout.js
│   ├── globals.css
│   ├── page.js
│   └── x/[slug]/page.js
├── lib/
│   ├── supabase/
│   │   ├── client.js
│   │   └── server.js
│   ├── queries.js
│   └── anonSession.js
├── middleware.js
├── next.config.mjs
├── jsconfig.json
├── package.json
├── .gitignore
└── .env.local.example
```

---

## Krok 2 — zmienne środowiskowe

W folderze `sondal-next` skopiuj plik:

```bash
cp .env.local.example .env.local
```

Plik `.env.local` już zawiera Twoje dane z Supabase (URL i klucz publiczny) — nic nie musisz zmieniać, chyba że chcesz użyć innego projektu.

**Ten plik nigdy nie trafia do gita** (jest w `.gitignore`) — to bezpieczne miejsce na klucze.

---

## Krok 3 — instalacja zależności

```bash
cd sondal-next
npm install
```

To pobierze Next.js, React, klienta Supabase i Lucide (ikony) — wszystko zgodnie z `package.json`.

---

## Krok 4 — uruchom lokalnie

```bash
npm run dev
```

Otwórz **http://localhost:3000** w przeglądarce. Powinieneś zobaczyć stronę z surowym JSON-em — to dane pobrane z Twojej bazy Supabase (na razie puste tablice, bo nie ma jeszcze żadnych sond w bazie).

Jeśli widzisz `communityPolls: []` i `editorialPolls: []` bez błędów — **połączenie z Supabase działa poprawnie**.

---

## Krok 5 — przenieś komponenty UI z makiety

To najważniejszy i najbardziej czasochłonny krok. Plan:

1. Otwórz `sondal_ekran_glowny.jsx` (Twoja makieta z Claude)
2. Każdy komponent (`DiscoverScreen`, `PollCard`, `HeroSlider`, `CreatorScreen`, itd.) wydziel do osobnego pliku w `components/`
3. Komponenty z `useState`, `onClick`, animacjami → dodaj `"use client";` jako pierwszą linię pliku
4. W `app/page.js` zaimportuj `DiscoverScreen` i podaj mu dane z `getCommunityPolls()` / `getEditorialPolls()` jako props zamiast hardkodowanych stałych

Przykład dla jednego komponentu:

```jsx
// components/PollCard.jsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { castVote, getMyVote } from "@/lib/queries";
import { getAnonSessionId } from "@/lib/anonSession";

export default function PollCard({ poll }) {
  const [voted, setVoted] = useState(null);
  const supabase = createClient();

  const handleVote = async (optionId) => {
    const anonSession = getAnonSessionId();
    await castVote(supabase, { pollId: poll.id, optionId, anonSession });
    setVoted(optionId);
  };

  // ... reszta JSX z makiety, podpięte handleVote zamiast lokalnego setVoted
}
```

Rób to ekran po ekranie — nie musisz przenieść wszystkiego naraz. Zacznij od ekranu głównego (`DiscoverScreen` + `PollCard`), potem `CreatorScreen`, potem reszta.

---

## Krok 6 — testowanie z prawdziwymi danymi

Żeby zobaczyć coś więcej niż puste tablice, dodaj testową sondę bezpośrednio w Supabase:

1. Supabase Dashboard → **Table Editor** → tabela `polls`
2. Kliknij **Insert row**
3. Wypełnij: `question`, `category` (np. `#Lokalne`), `kind` (`community`), `is_public` (`true`)
4. Zapisz — skopiuj wygenerowane `id` sondy
5. Przejdź do tabeli `poll_options` → dodaj 2 wiersze z tym samym `poll_id`, różnymi `label` i `position` (0, 1)

Odśwież `localhost:3000` — powinieneś zobaczyć tę sondę w JSON-ie.

---

## Krok 7 — deployment na Vercel

1. Stwórz nowe repo na GitHubie (np. `sondal-next`) i wypchnij tam kod:

```bash
git init
git add .
git commit -m "Initial Next.js + Supabase setup"
git remote add origin https://github.com/TWOJA-NAZWA/sondal-next.git
git push -u origin main
```

2. W Vercel: **Add New Project** → wybierz repo `sondal-next`
3. W ustawieniach projektu Vercel dodaj zmienne środowiskowe (**Settings → Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   (te same wartości co w `.env.local`)
4. Deploy — Vercel automatycznie wykryje że to Next.js i zbuduje poprawnie

---

## Kolejność prac (rekomendowana)

1. ✅ Schemat bazy (zrobione)
2. ✅ Starter Next.js (ten plik)
3. ⬜ Przenieś `DiscoverScreen` + `PollCard` — podstawowy feed z realnym głosowaniem
4. ⬜ Przenieś `CreatorScreen` — zapis nowej sondy do bazy (`createPoll()`)
5. ⬜ Przenieś `SharedPollScreen` pod `/x/[slug]` — już przygotowany szkielet
6. ⬜ Dodaj logowanie (Supabase Auth UI lub własny formularz + `supabase.auth.signUp()`)
7. ⬜ Przenieś `ProfileScreen` — lista sond zalogowanego użytkownika
8. ⬜ Embed widget pod `/x/[slug]/embed` — wersja bez nawigacji do `<iframe>`
9. ⬜ Podepnij domenę `sondal.top` w Vercel

---

## Pomoc przy kolejnych krokach

Każdy z powyższych punktów możemy zrobić razem — wklej mi treść pliku nad którym pracujesz (np. swój `DiscoverScreen`) i przepiszę go na Server/Client Component z podpiętymi zapytaniami do bazy.
