import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

type ModulePayload = {
  title?: string;
  position?: number;
  releaseAt?: string | null;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const body = await parseJson<ModulePayload>(request);
    const title = requiredText(body.title, "Nome do módulo");

    const { error } = await supabase
      .from("modules")
      .update({
        title,
        position: Math.max(1, Number(body.position || 1)),
        release_at: body.releaseAt ? new Date(body.releaseAt).toISOString() : null,
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

    const { data: lessons, error: lessonError } = await supabase
      .from("lessons")
      .select("video_storage_path")
      .eq("module_id", id);
    if (lessonError) throw new Error(lessonError.message);

    const paths = (lessons || []).map((lesson) => lesson.video_storage_path).filter(Boolean) as string[];
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("course-videos").remove(paths);
      if (storageError) throw new Error(storageError.message);
    }

    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
