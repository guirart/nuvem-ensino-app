import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

type LessonPayload = {
  title?: string;
  description?: string;
  position?: number;
  durationMinutes?: number;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const body = await parseJson<LessonPayload>(request);
    const title = requiredText(body.title, "Título da aula");

    const { error } = await supabase
      .from("lessons")
      .update({
        title,
        description: String(body.description || "").trim() || null,
        position: Math.max(1, Number(body.position || 1)),
        duration_seconds: Math.max(0, Math.round(Number(body.durationMinutes || 0) * 60)),
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
    const { data: lesson, error: fetchError } = await supabase
      .from("lessons")
      .select("video_storage_path")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);

    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw new Error(error.message);

    if (lesson?.video_storage_path) {
      const { error: storageError } = await supabase.storage
        .from("course-videos")
        .remove([lesson.video_storage_path]);
      if (storageError) throw new Error(storageError.message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
