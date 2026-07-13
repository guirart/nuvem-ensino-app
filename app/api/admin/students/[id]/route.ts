import { AdminApiError, apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

type StudentPayload = {
  fullName?: string;
  email?: string;
  password?: string;
  crm?: string;
  phone?: string;
  specialty?: string;
  role?: "student" | "instructor" | "admin";
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user } = await requireAdmin();
    const body = await parseJson<StudentPayload>(request);
    if (user.id === id && body.role && body.role !== "admin") {
      throw new AdminApiError("Você não pode remover o próprio perfil de administrador.");
    }
    const fullName = requiredText(body.fullName, "Nome");
    const email = requiredText(body.email, "E-mail").toLowerCase();
    const adminClient = createAdminClient();

    const authUpdate: { email: string; password?: string; user_metadata: Record<string, string> } = {
      email,
      user_metadata: {
        full_name: fullName,
        crm: String(body.crm || "").trim(),
      },
    };
    if (body.password) {
      if (body.password.length < 8) throw new AdminApiError("A nova senha deve ter ao menos 8 caracteres.");
      authUpdate.password = body.password;
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(id, authUpdate);
    if (authError) throw new Error(authError.message);

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name: fullName,
        email,
        crm: String(body.crm || "").trim() || null,
        phone: String(body.phone || "").trim() || null,
        specialty: String(body.specialty || "").trim() || null,
        role: body.role || "student",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (profileError) throw new Error(profileError.message);

    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { user } = await requireAdmin();
    if (user.id === id) throw new AdminApiError("Você não pode excluir a própria conta administrativa.");
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
