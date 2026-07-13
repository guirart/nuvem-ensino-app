import { notFound } from "next/navigation";
import { BookOpenCheck, Clock3, GraduationCap, Play } from "lucide-react";
import { getStudentCourseBySlug } from "@/lib/course-data";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ModuleList } from "@/components/course/module-list";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getStudentCourseBySlug(slug);
  if (!result) notFound();

  const { course, modules } = result;

  return (
    <div>
      <section className="overflow-hidden rounded-[1.7rem] p-6 text-white sm:p-8" style={{ background: course.accent }}>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <span className="badge bg-white/12 text-white">{course.category}</span>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">{course.description}</p>
            {course.nextLessonId ? <a href={`/aluno/aulas/${course.nextLessonId}`} className="btn-primary mt-6 w-full sm:w-auto"><Play size={19} fill="currentColor" /> Continuar curso</a> : <p className="mt-6 text-sm font-bold text-white/70">As aulas serão publicadas em breve.</p>}
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur">
            <ProgressBar value={course.progress} label="Seu progresso" />
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div><Clock3 size={18} /><p className="mt-2 font-black">{course.duration}</p><p className="text-xs text-white/60">Carga horária</p></div>
              <div><BookOpenCheck size={18} /><p className="mt-2 font-black">{course.totalLessons} aulas</p><p className="text-xs text-white/60">Conteúdo</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Conteúdo programático</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Módulos e aulas</h2>
          </div>
          {modules.length ? <ModuleList modules={modules} /> : <div className="card p-6 text-sm text-[#647b83]">Nenhum módulo foi publicado neste curso.</div>}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><GraduationCap size={23} /></div>
            <h3 className="mt-4 font-black">Professor responsável</h3>
            <p className="mt-1 text-sm font-bold">{course.instructor}</p>
            <p className="muted mt-3 text-sm leading-6">Conteúdo desenvolvido por especialistas com atuação clínica e acadêmica.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-black">Critérios para certificado</h3>
            <p className="muted mt-3 text-sm leading-6">Concluir todas as aulas obrigatórias e atingir a nota mínima nas avaliações previstas.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
