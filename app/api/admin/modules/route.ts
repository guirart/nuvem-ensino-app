import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

type ModulePayload = {
  courseId?: string;
  title?: string;
  position?: number;
  releaseAt?: string | null;
};

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await parseJson<ModulePayload>(request);
    const courseId = requiredText(body.courseId, "Curso");
    const title = requiredText(body.title, "Nome do módulo");

    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: courseId,
        title,
        position: Math.max(1, Number(body.position || 1)),
        release_at: body.releaseAt ? new Date(body.releaseAt).toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
