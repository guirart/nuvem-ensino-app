import { createClient } from "@/lib/supabase/server";

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new AdminApiError("Faça login novamente.", 401);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new AdminApiError("Acesso administrativo não autorizado.", 403);
  }

  return { supabase, user };
}

export function apiErrorResponse(error: unknown) {
  const status = error instanceof AdminApiError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Erro interno.";
  return Response.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AdminApiError("Dados inválidos.");
  }
}

export function requiredText(value: unknown, label: string) {
  const text = String(value || "").trim();
  if (!text) throw new AdminApiError(`${label} é obrigatório.`);
  return text;
}
