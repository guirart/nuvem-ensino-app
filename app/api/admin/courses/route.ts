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

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin();
    const body = await parseJson<CoursePayload>(request);
    const title = requiredText(body.title, "Título");
    const slug = slugify(body.slug || title);
    if (!slug) throw new Error("Não foi possível gerar o endereço do curso.");

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title,
        short_title: String(body.shortTitle || "").trim() || title,
        slug,
        description: String(body.description || "").trim() || null,
        workload_minutes: Math.max(0, Number(body.workloadMinutes || 0)),
        status: body.status || "draft",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const instructorIds = Array.from(new Set((body.instructorIds || []).filter(Boolean)));
    if (instructorIds.length) {
      const { error: instructorError } = await supabase.from("course_instructors").insert(
        instructorIds.map((instructorId) => ({
          course_id: course.id,
          instructor_id: instructorId,
        })),
      );
      if (instructorError) throw new Error(instructorError.message);
    }

    return Response.json({ id: course.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
