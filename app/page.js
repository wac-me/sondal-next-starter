// Server Component — pobiera dane z Supabase i przekazuje do SondalApp
import { createClient } from "@/lib/supabase/server";
import { getCommunityPolls, getEditorialPolls } from "@/lib/queries";
import { SondalApp } from "@/components/SondalApp";

export default async function HomePage() {
  const supabase = await createClient();

  const [communityPolls, editorialPolls] = await Promise.all([
    getCommunityPolls(supabase, { limit: 20 }).catch(() => []),
    getEditorialPolls(supabase).catch(() => []),
  ]);

  return (
    <SondalApp
      communityPolls={communityPolls}
      editorialPolls={editorialPolls}
    />
  );
}
