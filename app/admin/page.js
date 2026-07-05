// Server Component - sprawdza dostęp admina i renderuje panel
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/queries";
import { AdminScreen } from "@/components/screens/AdminScreen";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const isAdmin = await checkAdminAccess(supabase);

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminScreen />;
}
