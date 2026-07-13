import { demoUser } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return demoUser;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, crm")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    name: profile?.full_name || user.user_metadata.full_name || "Aluno",
    email: user.email || "",
    role: profile?.role || "student",
    crm: profile?.crm || "",
  };
}
