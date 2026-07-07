import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAccess } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export async function DELETE(request, { params }) {
  const { pollId } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = await checkAdminAccess(supabase);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminSupabase = createServiceRoleClient() || supabase;

  const { data, error } = await adminSupabase
    .from('polls')
    .delete()
    .eq('id', pollId)
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json(
      { error: 'Nie usunięto żadnego rekordu. Sprawdź RLS/policies albo czy pollId istnieje w tabeli polls.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, deleted: data[0] });
}
