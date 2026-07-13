import { createClient } from "@/lib/supabase/server";

export type AdminDashboardStats = {
  courses: number;
  publishedCourses: number;
  modules: number;
  lessons: number;
  students: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
};

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  workloadMinutes: number;
  professor: string;
  instructorIds: string[];
  moduleCount: number;
  lessonCount: number;
  activeEnrollments: number;
  averageProgress: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminStudentRow = {
  id: string;
  fullName: string;
  email: string;
  crm: string;
  phone: string;
  specialty: string;
  role: "student" | "instructor" | "admin";
  enrollmentCount: number;
  activeEnrollmentCount: number;
  averageProgress: number;
  createdAt: string;
};

export type AdminEnrollmentRow = {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  status: "pending" | "active" | "completed" | "cancelled" | "expired";
  startsAt: string;
  expiresAt: string | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  createdAt: string;
};

export type AdminRecentActivity = {
  id: string;
  type: "enrollment" | "lesson";
  title: string;
  detail: string;
  occurredAt: string;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  recentActivity: AdminRecentActivity[];
};

export type AdminCourseEditorData = {
  course: AdminCourseRow;
  modules: Array<{
    id: string;
    title: string;
    position: number;
    releaseAt: string | null;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
      durationSeconds: number;
      videoStoragePath: string | null;
    }>;
  }>;
  instructors: Array<{ id: string; fullName: string; email: string }>;
};

type AdminRawData = {
  profiles: any[];
  courses: any[];
  modules: any[];
  lessons: any[];
  enrollments: any[];
  progress: any[];
  instructorLinks: any[];
};

async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sessão não encontrada.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    throw new Error("Acesso administrativo não autorizado.");
  }

  return supabase;
}

async function loadAdminRawData(): Promise<AdminRawData> {
  const supabase = await getAdminClient();

  const [profilesResult, coursesResult, modulesResult, lessonsResult, enrollmentsResult, progressResult, linksResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, crm, phone, specialty, role, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("courses")
        .select("id, slug, title, short_title, description, workload_minutes, status, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase.from("modules").select("id, course_id, title, position, release_at, created_at"),
      supabase
        .from("lessons")
        .select(
          "id, module_id, title, description, position, duration_seconds, video_storage_path, created_at, updated_at",
        ),
      supabase
        .from("enrollments")
        .select("id, user_id, course_id, status, starts_at, expires_at, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("user_id, lesson_id, completed, watched_seconds, updated_at"),
      supabase.from("course_instructors").select("course_id, instructor_id"),
    ]);

  const requiredResults = [profilesResult, coursesResult, modulesResult, lessonsResult, enrollmentsResult, progressResult];
  const firstError = requiredResults.find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  return {
    profiles: profilesResult.data || [],
    courses: coursesResult.data || [],
    modules: modulesResult.data || [],
    lessons: lessonsResult.data || [],
    enrollments: enrollmentsResult.data || [],
    progress: progressResult.data || [],
    // A consulta pode retornar vazia antes da migração de políticas. O restante do painel continua funcional.
    instructorLinks: linksResult.data || [],
  };
}

function isCurrentEnrollment(enrollment: any) {
  if (!["active", "completed"].includes(enrollment.status)) return false;
  return !enrollment.expires_at || new Date(enrollment.expires_at).getTime() > Date.now();
}

function buildAnalytics(raw: AdminRawData) {
  const profileById = new Map(raw.profiles.map((profile) => [profile.id, profile]));
  const modulesByCourse = new Map<string, any[]>();
  const lessonsByModule = new Map<string, any[]>();
  const lessonsByCourse = new Map<string, any[]>();
  const completedByUser = new Map<string, Set<string>>();
  const enrollmentsByCourse = new Map<string, any[]>();
  const enrollmentsByUser = new Map<string, any[]>();
  const instructorsByCourse = new Map<string, string[]>();

  for (const module of raw.modules) {
    const list = modulesByCourse.get(module.course_id) || [];
    list.push(module);
    modulesByCourse.set(module.course_id, list);
  }

  for (const lesson of raw.lessons) {
    const list = lessonsByModule.get(lesson.module_id) || [];
    list.push(lesson);
    lessonsByModule.set(lesson.module_id, list);
  }

  for (const course of raw.courses) {
    const courseLessons = (modulesByCourse.get(course.id) || []).flatMap(
      (module) => lessonsByModule.get(module.id) || [],
    );
    lessonsByCourse.set(course.id, courseLessons);
  }

  for (const progress of raw.progress) {
    if (!progress.completed) continue;
    const set = completedByUser.get(progress.user_id) || new Set<string>();
    set.add(progress.lesson_id);
    completedByUser.set(progress.user_id, set);
  }

  for (const enrollment of raw.enrollments) {
    const byCourse = enrollmentsByCourse.get(enrollment.course_id) || [];
    byCourse.push(enrollment);
    enrollmentsByCourse.set(enrollment.course_id, byCourse);

    const byUser = enrollmentsByUser.get(enrollment.user_id) || [];
    byUser.push(enrollment);
    enrollmentsByUser.set(enrollment.user_id, byUser);
  }

  for (const link of raw.instructorLinks) {
    const list = instructorsByCourse.get(link.course_id) || [];
    list.push(link.instructor_id);
    instructorsByCourse.set(link.course_id, list);
  }

  function enrollmentProgress(enrollment: any) {
    const lessons = lessonsByCourse.get(enrollment.course_id) || [];
    if (!lessons.length) return { percentage: 0, completed: 0, total: 0 };
    const completedSet = completedByUser.get(enrollment.user_id) || new Set<string>();
    const completed = lessons.filter((lesson) => completedSet.has(lesson.id)).length;
    return {
      percentage: Math.round((completed / lessons.length) * 100),
      completed,
      total: lessons.length,
    };
  }

  function courseProgress(courseId: string) {
    const enrollments = (enrollmentsByCourse.get(courseId) || []).filter(isCurrentEnrollment);
    if (!enrollments.length) return 0;
    const total = enrollments.reduce((sum, enrollment) => sum + enrollmentProgress(enrollment).percentage, 0);
    return Math.round(total / enrollments.length);
  }

  function userProgress(userId: string) {
    const enrollments = (enrollmentsByUser.get(userId) || []).filter(isCurrentEnrollment);
    if (!enrollments.length) return 0;
    const total = enrollments.reduce((sum, enrollment) => sum + enrollmentProgress(enrollment).percentage, 0);
    return Math.round(total / enrollments.length);
  }

  return {
    profileById,
    modulesByCourse,
    lessonsByModule,
    lessonsByCourse,
    completedByUser,
    enrollmentsByCourse,
    enrollmentsByUser,
    instructorsByCourse,
    enrollmentProgress,
    courseProgress,
    userProgress,
  };
}

export async function getAdminCourses(): Promise<AdminCourseRow[]> {
  const raw = await loadAdminRawData();
  const analytics = buildAnalytics(raw);

  return raw.courses.map((course) => {
    const modules = analytics.modulesByCourse.get(course.id) || [];
    const lessons = analytics.lessonsByCourse.get(course.id) || [];
    const instructorIds = analytics.instructorsByCourse.get(course.id) || [];
    const instructorNames = instructorIds
      .map((id) => analytics.profileById.get(id)?.full_name)
      .filter(Boolean) as string[];
    const currentEnrollments = (analytics.enrollmentsByCourse.get(course.id) || []).filter(isCurrentEnrollment);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortTitle: course.short_title || course.title,
      description: course.description,
      status: course.status,
      workloadMinutes: course.workload_minutes || 0,
      professor: instructorNames.length ? instructorNames.join(", ") : "Não definido",
      instructorIds,
      moduleCount: modules.length,
      lessonCount: lessons.length,
      activeEnrollments: currentEnrollments.length,
      averageProgress: analytics.courseProgress(course.id),
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    };
  });
}

export async function getAdminStudents(): Promise<AdminStudentRow[]> {
  const raw = await loadAdminRawData();
  const analytics = buildAnalytics(raw);

  return raw.profiles.map((profile) => {
    const enrollments = analytics.enrollmentsByUser.get(profile.id) || [];
    return {
      id: profile.id,
      fullName: profile.full_name || "Nome não informado",
      email: profile.email || "",
      crm: profile.crm || "",
      phone: profile.phone || "",
      specialty: profile.specialty || "",
      role: profile.role,
      enrollmentCount: enrollments.length,
      activeEnrollmentCount: enrollments.filter(isCurrentEnrollment).length,
      averageProgress: analytics.userProgress(profile.id),
      createdAt: profile.created_at,
    };
  });
}

export async function getAdminEnrollments(): Promise<AdminEnrollmentRow[]> {
  const raw = await loadAdminRawData();
  const analytics = buildAnalytics(raw);
  const courseById = new Map(raw.courses.map((course) => [course.id, course]));

  return raw.enrollments.map((enrollment) => {
    const profile = analytics.profileById.get(enrollment.user_id);
    const course = courseById.get(enrollment.course_id);
    const progress = analytics.enrollmentProgress(enrollment);

    return {
      id: enrollment.id,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      studentName: profile?.full_name || "Aluno sem nome",
      studentEmail: profile?.email || "",
      courseTitle: course?.short_title || course?.title || "Curso removido",
      status: enrollment.status,
      startsAt: enrollment.starts_at,
      expiresAt: enrollment.expires_at,
      progress: progress.percentage,
      completedLessons: progress.completed,
      totalLessons: progress.total,
      createdAt: enrollment.created_at,
    };
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const raw = await loadAdminRawData();
  const analytics = buildAnalytics(raw);
  const currentEnrollments = raw.enrollments.filter(isCurrentEnrollment);
  const progressValues = currentEnrollments.map((enrollment) => analytics.enrollmentProgress(enrollment).percentage);
  const averageProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
    : 0;

  const courseById = new Map(raw.courses.map((course) => [course.id, course]));
  const moduleById = new Map(raw.modules.map((module) => [module.id, module]));

  const enrollmentActivities: AdminRecentActivity[] = raw.enrollments.slice(0, 6).map((enrollment) => {
    const profile = analytics.profileById.get(enrollment.user_id);
    const course = courseById.get(enrollment.course_id);
    return {
      id: `enrollment-${enrollment.id}`,
      type: "enrollment",
      title: `Matrícula ${enrollment.status === "active" ? "ativada" : "registrada"}`,
      detail: `${profile?.full_name || "Aluno"} — ${course?.short_title || course?.title || "Curso"}`,
      occurredAt: enrollment.created_at,
    };
  });

  const lessonActivities: AdminRecentActivity[] = [...raw.lessons]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((lesson) => {
      const module = moduleById.get(lesson.module_id);
      const course = module ? courseById.get(module.course_id) : null;
      return {
        id: `lesson-${lesson.id}`,
        type: "lesson",
        title: "Aula adicionada",
        detail: `${lesson.title} — ${course?.short_title || course?.title || "Curso"}`,
        occurredAt: lesson.created_at,
      };
    });

  return {
    stats: {
      courses: raw.courses.length,
      publishedCourses: raw.courses.filter((course) => course.status === "published").length,
      modules: raw.modules.length,
      lessons: raw.lessons.length,
      students: raw.profiles.filter((profile) => profile.role === "student").length,
      activeEnrollments: raw.enrollments.filter((enrollment) => enrollment.status === "active" && isCurrentEnrollment(enrollment)).length,
      completedEnrollments: raw.enrollments.filter((enrollment) => enrollment.status === "completed").length,
      averageProgress,
    },
    recentActivity: [...enrollmentActivities, ...lessonActivities]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 8),
  };
}

export async function getAdminCourseEditorData(id: string): Promise<AdminCourseEditorData | null> {
  const raw = await loadAdminRawData();
  const analytics = buildAnalytics(raw);
  const course = (await getAdminCourses()).find((item) => item.id === id);
  if (!course) return null;

  const modules = (analytics.modulesByCourse.get(id) || [])
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      id: module.id,
      title: module.title,
      position: module.position,
      releaseAt: module.release_at,
      lessons: (analytics.lessonsByModule.get(module.id) || [])
        .sort((a, b) => a.position - b.position)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          position: lesson.position,
          durationSeconds: lesson.duration_seconds || 0,
          videoStoragePath: lesson.video_storage_path,
        })),
    }));

  const instructors = raw.profiles
    .filter((profile) => ["instructor", "admin"].includes(profile.role))
    .map((profile) => ({
      id: profile.id,
      fullName: profile.full_name || profile.email || "Professor",
      email: profile.email || "",
    }));

  return { course, modules, instructors };
}

export async function getAdminFormOptions() {
  const [students, courses] = await Promise.all([getAdminStudents(), getAdminCourses()]);
  return {
    students: students.filter((student) => student.role === "student"),
    courses: courses.filter((course) => course.status !== "archived"),
  };
}
