import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Play, Sparkles, Trophy } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentCourses } from "@/lib/course-data";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const courses = await getStudentCourses();
  const activeCourses = courses.filter((course) => course.status === "active");
  const featured = activeCourses.find((course) => course.nextLessonId) || activeCourses[0];

  return (
    <div>
      {featured ? (
        <section className="overflow-hidden rounded-[1.7rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow)] sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <span className="badge bg-white/10 text-white"><Sparkles size={14} /> Continue de onde parou</span>
              <h1 className="mt-5 max-w-2xl text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl">{featured.nextLessonTitle || featured.shortTitle}</h1>
              <p className="mt-3 text-sm font-semibold text-white/65">{featured.shortTitle}</p>
              {featured.nextLessonId ? <Link href={`/aluno/aulas/${featured.nextLessonId}`} className="btn-primary mt-6 w-full sm:w-auto"><Play size={19} fill="currentColor" /> Continuar aula</Link> : <Link href={`/aluno/cursos/${featured.slug}`} className="btn-primary mt-6 w-full sm:w-auto">Abrir curso</Link>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <ProgressBar value={featured.progress} label="Progresso do curso" />
              <p className="mt-4 text-sm leading-6 text-white/60">{featured.completedLessons} de {featured.totalLessons} aulas concluídas.</p>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState icon={BookOpen} title="Sua biblioteca está vazia" description="Assim que sua matrícula for ativada, os cursos aparecerão aqui." />
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><CalendarDays size={22} /></div><p className="muted mt-4 text-xs font-bold uppercase tracking-wider">Próximo encontro</p><p className="mt-1 font-extrabold">Consulte o cronograma</p><p className="muted mt-1 text-sm">Novas datas serão informadas</p></div>
        <div className="card p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f6edd8] text-[#80611e]"><Trophy size={22} /></div><p className="muted mt-4 text-xs font-bold uppercase tracking-wider">Formação</p><p className="mt-1 font-extrabold">{courses.length} curso(s) liberado(s)</p><p className="muted mt-1 text-sm">Continue sua atualização</p></div>
        <div className="card p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f3ed] text-[#277156]"><Play size={22} /></div><p className="muted mt-4 text-xs font-bold uppercase tracking-wider">Aulas concluídas</p><p className="mt-1 font-extrabold">{courses.reduce((sum, course) => sum + course.completedLessons, 0)}</p><p className="muted mt-1 text-sm">Em todos os cursos</p></div>
      </section>

      <section className="mt-9">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Sua biblioteca</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Cursos em andamento</h2></div><Link href="/aluno/cursos" className="hidden items-center gap-2 text-sm font-extrabold text-[var(--brand-dark)] sm:flex">Ver todos <ArrowRight size={17} /></Link></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{activeCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      </section>
    </div>
  );
}
