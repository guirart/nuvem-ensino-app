import type { Metadata } from "next";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { courses } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Meus cursos" };

export default function CoursesPage() {
  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Biblioteca</p>
          <h1 className="page-title mt-2">Meus cursos</h1>
          <p className="muted mt-3">Acesse apenas os conteúdos vinculados à sua matrícula.</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83969b]" size={18} />
          <input className="input-field pl-10" placeholder="Buscar curso" />
        </label>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
}
