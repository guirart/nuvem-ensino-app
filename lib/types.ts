export type UserRole = "student" | "instructor" | "admin";

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  instructor: string;
  category: string;
  description: string;
  duration: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
  accent: string;
  status: "active" | "coming-soon" | "completed";
};

export type Module = {
  id: string;
  title: string;
  order: number;
  released: boolean;
  releaseLabel?: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  duration: string;
  type: "video" | "live" | "material";
  completed: boolean;
  locked?: boolean;
  description?: string;
};

export type Certificate = {
  id: string;
  courseTitle: string;
  issuedAt: string;
  workload: string;
  status: "available" | "pending";
};
