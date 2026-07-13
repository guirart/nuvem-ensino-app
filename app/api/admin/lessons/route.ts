import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

type LessonPayload = {
  moduleId?: string;
  title?: string;
  description?: string;
  position?: number;
  durationMinutes?: number;
  videoStoragePath?: string;
  isPreview?: boolean;
};

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await parseJson<LessonPayload>(request);
    const moduleId = requiredText(body.moduleId, "Módulo");
    const title = requiredText(body.title, "Título da aula");
    const videoStoragePath = requiredText(body.videoStoragePath, "Arquivo de vídeo");

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        module_id: moduleId,
        title,
        description: String(body.description || "").trim() || null,
        lesson_type: "video",
        position: Math.max(1, Number(body.position || 1)),
        duration_seconds: Math.max(0, Math.round(Number(body.durationMinutes || 0) * 60)),
        video_provider: "supabase",
        video_storage_path: videoStoragePath,
        video_asset_id: videoStoragePath,
        is_preview: Boolean(body.isPreview),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
