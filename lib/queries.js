// Przykładowe funkcje do pobierania i zapisywania danych.
// Importuj odpowiedni klient (client.js w komponentach klienckich,
// server.js w Server Components) i wywołuj te funkcje.

// ─── Pobierz sondy społecznościowe (feed) ──────────────────
export async function getCommunityPolls(supabase, { category = null, limit = 20 } = {}) {
  let query = supabase
    .from('polls')
    .select(`
      id, slug, question, category, created_at, is_anonymous,
      profiles!left ( handle, avatar_letter ),
      poll_options ( id, label, position )
    `)
    .eq('kind', 'community')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category && category !== '#Wszystkie') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── Pobierz sondy redakcyjne (hero slider) ────────────────
export async function getEditorialPolls(supabase) {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id, slug, question, source_tag, created_at,
      poll_options ( id, label, position )
    `)
    .eq('kind', 'editorial')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data;
}

// ─── Pobierz pojedynczą sondę po slug (np. dla /x/abc) ─────
export async function getPollBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id, slug, question, category, created_at, allow_comments, is_anonymous,
      profiles!left ( handle, avatar_letter ),
      poll_options ( id, label, position )
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// ─── Pobierz wyniki głosowania (z widoku poll_results) ─────
export async function getPollResults(supabase, pollId) {
  const { data, error } = await supabase
    .from('poll_results')
    .select('*')
    .eq('poll_id', pollId)
    .order('position');

  if (error) throw error;
  return data;
}

// ─── Oddaj głos ─────────────────────────────────────────────
// userId: id zalogowanego użytkownika, albo null
// anonSession: UUID z localStorage dla niezalogowanych (patrz lib/anonSession.js)
export async function castVote(supabase, { pollId, optionId, userId = null, anonSession = null }) {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      anon_session: userId ? null : anonSession,
    })
    .select()
    .single();

  if (error) {
    // Constraint unique_user_vote / unique_anon_vote — użytkownik już głosował
    if (error.code === '23505') {
      throw new Error('Już zagłosowałeś w tej sondzie');
    }
    throw error;
  }
  return data;
}

// ─── Sprawdź czy użytkownik/sesja już głosowała ────────────
export async function getMyVote(supabase, { pollId, userId = null, anonSession = null }) {
  let query = supabase.from('votes').select('option_id').eq('poll_id', pollId);
  query = userId ? query.eq('user_id', userId) : query.eq('anon_session', anonSession);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data?.option_id ?? null;
}

// ─── Stwórz nową sondę (Kreator) ────────────────────────────
export async function createPoll(supabase, { question, options, category, isPublic, isAnonymous, authorId }) {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      question,
      category,
      is_public: isPublic,
      is_anonymous: isAnonymous,
      author_id: authorId,
      kind: 'community',
    })
    .select()
    .single();

  if (pollError) throw pollError;

  const optionsToInsert = options.map((label, i) => ({
    poll_id: poll.id,
    label,
    position: i,
  }));

  const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);
  if (optionsError) throw optionsError;

  // Wygeneruj slug jeśli baza go nie zwróciła
  const slug = poll.slug || `x/${Math.random().toString(36).slice(2, 7)}`;
  return { ...poll, slug }; // Zwróć poll z slug do linku
}

// ─── Pobierz komentarze do sondy ────────────────────────────
export async function getComments(supabase, pollId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, content, created_at, option_id,
      profiles ( handle, avatar_letter )
    `)
    .eq('poll_id', pollId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ─── Dodaj komentarz (z plakietką "Głosował na opcję X") ───
export async function addComment(supabase, { pollId, authorId, content, optionId }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ poll_id: pollId, author_id: authorId, content, option_id: optionId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Subskrybuj zmiany głosów na żywo (Realtime) ───────────
// Użycie w komponencie klienckim:
//   useEffect(() => {
//     const channel = subscribeToVotes(supabase, pollId, () => refetchResults());
//     return () => channel.unsubscribe();
//   }, [pollId]);
export function subscribeToVotes(supabase, pollId, onChange) {
  return supabase
    .channel(`votes:${pollId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` },
      onChange
    )
    .subscribe();
}


// ─── DOPISZ TE FUNKCJE NA KOŃCU lib/queries.js ────────────

// Pobierz profil zalogowanego użytkownika
export async function getMyProfile(supabase) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return { ...data, email: user.email };
}

// Pobierz sondy użytkownika
export async function getMyPolls(supabase, userId) {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      id, slug, question, category, is_public, created_at, ends_at,
      poll_options ( id, label, position )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Pobierz liczbę głosów dla każdej sondy użytkownika
export async function getPollVoteCounts(supabase, pollIds) {
  if (!pollIds.length) return {};
  const { data, error } = await supabase
    .from('poll_vote_totals')
    .select('poll_id, total_votes')
    .in('poll_id', pollIds);

  if (error) throw error;
  // Zamień na słownik { pollId: totalVotes }
  return Object.fromEntries(data.map(r => [r.poll_id, r.total_votes]));
}

// Pobierz liczbę komentarzy dla każdej sondy
export async function getPollCommentCounts(supabase, pollIds) {
  if (!pollIds.length) return {};
  const { data, error } = await supabase
    .from('comments')
    .select('poll_id')
    .in('poll_id', pollIds)
    .eq('is_hidden', false);

  if (error) throw error;
  const counts = {};
  data.forEach(r => { counts[r.poll_id] = (counts[r.poll_id] || 0) + 1; });
  return counts;
}

// Zmień widoczność sondy (publiczna/prywatna)
export async function togglePollVisibility(supabase, pollId, isPublic) {
  const { error } = await supabase
    .from('polls')
    .update({ is_public: isPublic })
    .eq('id', pollId);

  if (error) throw error;
}

// Zakończ głosowanie (ustaw ends_at na teraz)
export async function endPoll(supabase, pollId) {
  const { error } = await supabase
    .from('polls')
    .update({ ends_at: new Date().toISOString() })
    .eq('id', pollId);

  if (error) throw error;
}

// Usuń sondę (kaskadowo usuwa opcje, głosy, komentarze — dzięki ON DELETE CASCADE)
export async function deletePoll(supabase, pollId) {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (error) throw error;
}

// Zaktualizuj profil użytkownika
export async function updateProfile(supabase, userId, { handle, display_name }) {
  const { error } = await supabase
    .from('profiles')
    .update({ handle, display_name })
    .eq('id', userId);

  if (error) throw error;
}

