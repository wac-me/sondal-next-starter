// Generuje i przechowuje unikalny identyfikator sesji dla niezalogowanych
// użytkowników. Dzięki temu mogą głosować bez konta, a baza wciąż
// pilnuje że nie zagłosują dwa razy w tej samej sondzie (patrz constraint
// unique_anon_session w schemacie SQL).

const STORAGE_KEY = 'sondal_anon_session';

export function getAnonSessionId() {
  if (typeof window === 'undefined') return null; // SSR guard

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
