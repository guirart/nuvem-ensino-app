import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";
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

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJson<StudentPayload>(request);
    const fullName = requiredText(body.fullName, "Nome");
    const email = requiredText(body.email, "E-mail").toLowerCase();
    const password = requiredText(body.password, "Senha temporária");
    if (password.length < 8) throw new Error("A senha temporária deve ter ao menos 8 caracteres.");

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        crm: String(body.crm || "").trim(),
      },
    });
    if (error || !data.user) throw new Error(error?.message || "Não foi possível criar a conta.");

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      crm: String(body.crm || "").trim() || null,
      phone: String(body.phone || "").trim() || null,
      specialty: String(body.specialty || "").trim() || null,
      role: body.role || "student",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      throw new Error(profileError.message);
    }

    return Response.json({ id: data.user.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
