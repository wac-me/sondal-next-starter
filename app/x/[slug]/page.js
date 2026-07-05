// Dynamiczny route dla sondal.top/x/[slug] — czyli udostępnianych linków.
import { createClient } from '@/lib/supabase/server';
import { getPollBySlug, getPollResults } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { SharedPollScreen } from '@/components/screens/SharedPollScreen';

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
    <SharedPollScreen poll={poll} initialResults={results} />
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
