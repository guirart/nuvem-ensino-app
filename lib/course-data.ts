import { isSupabaseConfigured } from "@/lib/env";
import { courses as demoCourses, getCourseBySlug, getLessonById, modulesByCourse } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, Module } from "@/lib/types";

const accents = [
  "linear-gradient(145deg, #174652, #21869a)",
  "linear-gradient(145deg, #315b4f, #4b8a76)",
  "linear-gradient(145deg, #5b4778, #8a6aa9)",
  "linear-gradient(145deg, #4b5068, #70799e)",
];

export type CourseDetail = {
  course: Course;
  modules: Module[];
};

export type LessonDetail = {
  lesson: Lesson & { description?: string };
  course: Course;
  moduleTitle: string;
  videoUrl: string | null;
};

export type AdminLesson = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  durationSeconds: number;
  videoStoragePath: string | null;
  createdAt: string;
};

export type AdminModule = {
  id: string;
  title: string;
  position: number;
  releaseAt: string | null;
  lessons: AdminLesson[];
};

export type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  description: string | null;
  workloadMinutes: number;
  status: "draft" | "published" | "archived";
  modules: AdminModule[];
};

function formatMinutes(minutes: number) {
  if (!minutes) return "Carga horária não informada";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function formatSeconds(seconds: number) {
  if (!seconds) return "Vídeo";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  if (hours) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

function accentFor(index: number) {
  return accents[index % accents.length];
}

function isReleased(releaseAt: string | null | undefined) {
  return !releaseAt || new Date(releaseAt).getTime() <= Date.now();
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: "student" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    role: (profile?.role || "student") as "student" | "instructor" | "admin",
  };
}

async function getProgressSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  lessonIds: string[],
) {
  if (!lessonIds.length) return new Set<string>();

  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .eq("completed", true);

  return new Set<string>((data || []).map((item: any) => item.lesson_id as string));
}

function buildCourseView(
  row: any,
  completed: Set<string>,
  index: number,
): Course {
  const modules = [...(row.modules || [])].sort((a: any, b: any) => a.position - b.position);
  const lessons = modules.flatMap((module: any) =>
    [...(module.lessons || [])].sort((a: any, b: any) => a.position - b.position),
  );
  const completedLessons = lessons.filter((lesson: any) => completed.has(lesson.id)).length;
  const nextLesson = lessons.find((lesson: any) => !completed.has(lesson.id));
  const progress = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title || row.title,
    instructor: "Equipe NU.V.E.M",
    category: "Educação médica",
    description: row.description || "Conteúdo de atualização profissional para médicos.",
    duration: formatMinutes(row.workload_minutes || 0),
    progress,
    totalLessons: lessons.length,
    completedLessons,
    nextLessonId: nextLesson?.id,
    nextLessonTitle: nextLesson?.title,
    accent: accentFor(index),
    status: lessons.length > 0 && completedLessons === lessons.length ? "completed" : "active",
  };
}

function buildModulesView(moduleRows: any[], lessonRows: any[], completed: Set<string>): Module[] {
  return [...moduleRows]
    .sort((a, b) => a.position - b.position)
    .map((moduleRow) => {
      const released = isReleased(moduleRow.release_at);
      const lessons = lessonRows
        .filter((lesson) => lesson.module_id === moduleRow.id)
        .sort((a, b) => a.position - b.position)
        .map((lesson): Lesson => ({
          id: lesson.id,
          moduleId: moduleRow.id,
          title: lesson.title,
          duration: formatSeconds(lesson.duration_seconds || 0),
          type: lesson.lesson_type,
          completed: completed.has(lesson.id),
          locked: !released,
          description: lesson.description || undefined,
        }));

      return {
        id: moduleRow.id,
        title: moduleRow.title,
        order: moduleRow.position,
        released,
        releaseLabel: released
          ? undefined
          : `Liberação em ${new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
            }).format(new Date(moduleRow.release_at))}`,
        lessons,
      };
    });
}

export async function getStudentCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured()) return demoCourses;

  const { supabase, user, role } = await getAuthenticatedContext();
  if (!user) return [];

  let courseIds: string[] | null = null;

  if (role !== "admin") {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id, expires_at")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"]);

    if (enrollmentError) throw new Error(enrollmentError.message);
    const enrolledCourseIds = (enrollments || [])
      .filter((row: any) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now())
      .map((row: any) => row.course_id as string);
    if (!enrolledCourseIds.length) return [];
    courseIds = enrolledCourseIds;
  }

  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, short_title, description, workload_minutes, status, modules(id, position, release_at, lessons(id, title, position))",
    )
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (courseIds) query = query.in("id", courseIds);
  if (role !== "admin") query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const lessonIds = (data || []).flatMap((course: any) =>
    (course.modules || []).flatMap((module: any) =>
      (module.lessons || []).map((lesson: any) => lesson.id as string),
    ),
  );
  const completed = await getProgressSet(supabase, user.id, lessonIds);

  return (data || []).map((course: any, index: number) => buildCourseView(course, completed, index));
}

export async function getStudentCourseBySlug(slug: string): Promise<CourseDetail | null> {
  if (!isSupabaseConfigured()) {
    const course = getCourseBySlug(slug);
    const modules = modulesByCourse[slug];
    return course && modules ? { course, modules } : null;
  }

  const { supabase, user, role } = await getAuthenticatedContext();
  if (!user) return null;

  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, short_title, description, workload_minutes, status")
    .eq("slug", slug)
    .maybeSingle();

  if (courseError || !courseRow) return null;

  if (role !== "admin") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", courseRow.id)
      .in("status", ["active", "completed"])
      .maybeSingle();

    if (!enrollment || (enrollment.expires_at && new Date(enrollment.expires_at).getTime() <= Date.now())) return null;
  }

  const { data: moduleRows, error: moduleError } = await supabase
    .from("modules")
    .select("id, course_id, title, position, release_at")
    .eq("course_id", courseRow.id)
    .order("position");
  if (moduleError) throw new Error(moduleError.message);

  const moduleIds = (moduleRows || []).map((row: any) => row.id as string);
  let lessonRows: any[] = [];

  if (moduleIds.length) {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, module_id, title, description, lesson_type, position, duration_seconds")
      .in("module_id", moduleIds)
      .order("position");
    if (error) throw new Error(error.message);
    lessonRows = data || [];
  }

  const completed = await getProgressSet(
    supabase,
    user.id,
    lessonRows.map((lesson: any) => lesson.id as string),
  );
  const modules = buildModulesView(moduleRows || [], lessonRows, completed);
  const course = buildCourseView(
    {
      ...courseRow,
      modules: modules.map((module) => ({
        position: module.order,
        lessons: module.lessons.map((lesson, position) => ({
          id: lesson.id,
          title: lesson.title,
          position,
        })),
      })),
    },
    completed,
    0,
  );

  return { course, modules };
}

export async function getStudentLessonById(id: string): Promise<LessonDetail | null> {
  if (!isSupabaseConfigured()) {
    const result = getLessonById(id);
    if (!result || !result.course) return null;
    return {
      lesson: result.lesson,
      course: result.course,
      moduleTitle: result.module.title,
      videoUrl: null,
    };
  }

  const { supabase, user } = await getAuthenticatedContext();
  if (!user) return null;

  const { data: lessonRow, error } = await supabase
    .from("lessons")
    .select(
      "id, module_id, title, description, lesson_type, position, duration_seconds, video_storage_path, modules!inner(id, title, course_id, courses!inner(id, slug, title, short_title, description, workload_minutes, status))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !lessonRow) return null;

  const moduleRelation = Array.isArray((lessonRow as any).modules)
    ? (lessonRow as any).modules[0]
    : (lessonRow as any).modules;
  const courseRelation = Array.isArray(moduleRelation?.courses)
    ? moduleRelation.courses[0]
    : moduleRelation?.courses;
  if (!moduleRelation || !courseRelation) return null;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", id)
    .maybeSingle();

  let videoUrl: string | null = null;
  const storagePath = (lessonRow as any).video_storage_path as string | null;
  if (storagePath) {
    const { data: signedData } = await supabase.storage
      .from("course-videos")
      .createSignedUrl(storagePath, 60 * 60 * 2);
    videoUrl = signedData?.signedUrl || null;
  }

  const lesson: Lesson & { description?: string } = {
    id: lessonRow.id,
    moduleId: lessonRow.module_id,
    title: lessonRow.title,
    description: lessonRow.description || undefined,
    duration: formatSeconds(lessonRow.duration_seconds || 0),
    type: lessonRow.lesson_type,
    completed: Boolean(progress?.completed),
  };

  const course = buildCourseView(
    {
      ...courseRelation,
      modules: [{ position: 1, lessons: [{ id: lesson.id, title: lesson.title, position: 1 }] }],
    },
    progress?.completed ? new Set<string>([lesson.id]) : new Set<string>(),
    0,
  );

  return {
    lesson,
    course,
    moduleTitle: moduleRelation.title,
    videoUrl,
  };
}

export async function getAdminCatalog(): Promise<AdminCourse[]> {
  if (!isSupabaseConfigured()) return [];

  const { supabase, user, role } = await getAuthenticatedContext();
  if (!user || role !== "admin") return [];

  const { data: courseRows, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, short_title, description, workload_minutes, status")
    .order("created_at", { ascending: false });
  if (courseError) throw new Error(courseError.message);

  const courseIds = (courseRows || []).map((row: any) => row.id as string);
  let moduleRows: any[] = [];
  if (courseIds.length) {
    const { data, error } = await supabase
      .from("modules")
      .select("id, course_id, title, position, release_at")
      .in("course_id", courseIds)
      .order("position");
    if (error) throw new Error(error.message);
    moduleRows = data || [];
  }

  const moduleIds = moduleRows.map((row) => row.id as string);
  let lessonRows: any[] = [];
  if (moduleIds.length) {
    const { data, error } = await supabase
      .from("lessons")
      .select(
        "id, module_id, title, description, position, duration_seconds, video_storage_path, created_at",
      )
      .in("module_id", moduleIds)
      .order("position");
    if (error) throw new Error(error.message);
    lessonRows = data || [];
  }

  return (courseRows || []).map((courseRow: any) => ({
    id: courseRow.id,
    slug: courseRow.slug,
    title: courseRow.title,
    shortTitle: courseRow.short_title,
    description: courseRow.description,
    workloadMinutes: courseRow.workload_minutes,
    status: courseRow.status,
    modules: moduleRows
      .filter((moduleRow) => moduleRow.course_id === courseRow.id)
      .sort((a, b) => a.position - b.position)
      .map((moduleRow) => ({
        id: moduleRow.id,
        title: moduleRow.title,
        position: moduleRow.position,
        releaseAt: moduleRow.release_at,
        lessons: lessonRows
          .filter((lessonRow) => lessonRow.module_id === moduleRow.id)
          .sort((a, b) => a.position - b.position)
          .map((lessonRow) => ({
            id: lessonRow.id,
            title: lessonRow.title,
            description: lessonRow.description,
            position: lessonRow.position,
            durationSeconds: lessonRow.duration_seconds,
            videoStoragePath: lessonRow.video_storage_path,
            createdAt: lessonRow.created_at,
          })),
      })),
  }));
}
