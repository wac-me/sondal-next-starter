// Dynamiczny route dla sondal.top/x/[slug] — czyli udostępnianych linków.
// To odpowiednik ekranu SharedPollScreen z makiety, ale zasilany prawdziwymi
// danymi z bazy zamiast mocków.

import { createClient } from '@/lib/supabase/server';
import { getPollBySlug, getPollResults } from '@/lib/queries';
import { notFound } from 'next/navigation';

export default async function SharedPollPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  let poll;
  try {
    poll = await getPollBySlug(supabase, slug);
  } catch {
    notFound(); // pokaże stronę 404 jeśli slug nie istnieje
  }

  const results = await getPollResults(supabase, poll.id);

  return (
    <main>
      {/*
        Tu wklej komponent SharedPollScreen z makiety, przekazując:
        <SharedPollScreen poll={poll} results={results} />

        Pamiętaj: SharedPollScreen używa useState do głosowania,
        więc musi być komponentem klienckim ("use client" na górze).
        Ta strona (page.js) zostaje Server Component i tylko pobiera
        dane — to dobry pattern: serwer pobiera, klient interaguje.
      */}
      <pre style={{ color: '#fff', padding: 20 }}>
        {JSON.stringify({ poll, results }, null, 2)}
      </pre>
    </main>
  );
}

// Generuje meta tagi (og:title, og:description) dla każdej sondy osobno
// — ważne dla udostępniania na Facebooku/Twitterze z ładnym podglądem
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  try {
    const poll = await getPollBySlug(supabase, slug);
    return {
      title: `${poll.question} — sondal.top`,
      description: 'Zagłosuj i zobacz co myślą inni. Sonda to argument.',
    };
  } catch {
    return { title: 'Sonda nie znaleziona — sondal.top' };
  }
}
