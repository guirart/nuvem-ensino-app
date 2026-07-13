import { apiErrorResponse, parseJson, requireAdmin, requiredText } from "@/lib/admin-api";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CoursePayload = {
  title?: string;
  shortTitle?: string;
  slug?: string;
  description?: string;
  workloadMinutes?: number;
  status?: "draft" | "published" | "archived";
  instructorIds?: string[];
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const body = await parseJson<CoursePayload>(request);
    const title = requiredText(body.title, "Título");
    const slug = slugify(body.slug || title);

    const { error } = await supabase
      .from("courses")
      .update({
        title,
        short_title: String(body.shortTitle || "").trim() || title,
        slug,
        description: String(body.description || "").trim() || null,
        workload_minutes: Math.max(0, Number(body.workloadMinutes || 0)),
        status: body.status || "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    const { error: deleteLinksError } = await supabase
      .from("course_instructors")
      .delete()
      .eq("course_id", id);
    if (deleteLinksError) throw new Error(deleteLinksError.message);

    const instructorIds = Array.from(new Set((body.instructorIds || []).filter(Boolean)));
    if (instructorIds.length) {
      const { error: insertLinksError } = await supabase.from("course_instructors").insert(
        instructorIds.map((instructorId) => ({
          course_id: id,
          instructor_id: instructorId,
        })),
      );
      if (insertLinksError) throw new Error(insertLinksError.message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("courses")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
