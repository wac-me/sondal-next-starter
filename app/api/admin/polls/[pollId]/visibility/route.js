import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAdminAccess } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export async function PATCH(request, { params }) {
  const { pollId } = await params;
  const body = await request.json().catch(() => ({}));
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

  const { error } = await adminSupabase
    .from('polls')
    .update({ is_public: Boolean(body.isPublic) })
    .eq('id', pollId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
