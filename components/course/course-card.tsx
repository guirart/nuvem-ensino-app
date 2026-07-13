import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import type { Course } from "@/lib/types";
import { ProgressBar } from "@/components/ui/progress-bar";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/aluno/cursos/${course.slug}`} className="card card-hover overflow-hidden">
      <div className="relative min-h-36 p-5 text-white" style={{ background: course.accent }}>
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/15" />
        <div className="absolute -right-2 top-8 h-24 w-24 rounded-full border border-white/10" />
        <span className="badge bg-white/12 text-white backdrop-blur">{course.category}</span>
        <h3 className="mt-4 max-w-sm text-xl font-black leading-tight tracking-[-0.025em]">
          {course.shortTitle}
        </h3>
        <p className="mt-2 text-sm font-semibold text-white/74">{course.instructor}</p>
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4 text-xs font-bold text-[#61777e]">
          <span className="flex items-center gap-1.5"><Clock3 size={15} /> {course.duration}</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={15} /> {course.completedLessons}/{course.totalLessons} aulas</span>
        </div>
        <ProgressBar value={course.progress} label="Progresso" />
        <div className="mt-5 flex items-center justify-between text-sm font-extrabold text-[var(--brand-dark)]">
          Acessar curso <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  );
}
