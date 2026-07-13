import { apiErrorResponse, parseJson, requireAdmin } from "@/lib/admin-api";

type EnrollmentPayload = {
  status?: "pending" | "active" | "completed" | "cancelled" | "expired";
  startsAt?: string;
  expiresAt?: string | null;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const body = await parseJson<EnrollmentPayload>(request);

    const { error } = await supabase
      .from("enrollments")
      .update({
        status: body.status || "active",
        starts_at: body.startsAt ? new Date(body.startsAt).toISOString() : new Date().toISOString(),
        expires_at: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
