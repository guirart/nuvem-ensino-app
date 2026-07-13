import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

type EnrollmentPayload = {
  userId?: string;
  courseId?: string;
  status?: "pending" | "active" | "completed" | "cancelled" | "expired";
  startsAt?: string;
  expiresAt?: string | null;
};

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await parseJson<EnrollmentPayload>(request);
    const userId = requiredText(body.userId, "Aluno");
    const courseId = requiredText(body.courseId, "Curso");

    const { data, error } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: body.status || "active",
          starts_at: body.startsAt ? new Date(body.startsAt).toISOString() : new Date().toISOString(),
          expires_at: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" },
      )
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
