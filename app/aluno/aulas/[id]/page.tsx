import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileDown, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import { getStudentLessonById } from "@/lib/course-data";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getStudentLessonById(id);
  if (!result) notFound();

  const { lesson, course, videoUrl, moduleTitle } = result;

  return (
    <div>
      <Link href={`/aluno/cursos/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--brand-dark)]">
        <ArrowLeft size={17} /> Voltar ao curso
      </Link>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="aspect-video overflow-hidden rounded-[1.4rem] bg-[#0f242c] shadow-[var(--shadow)]">
            {videoUrl ? (
              <video className="h-full w-full bg-black" controls preload="metadata" controlsList="nodownload" src={videoUrl}>
                Seu navegador não conseguiu reproduzir este vídeo.
              </video>
            ) : (
              <div className="relative grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(33,134,154,0.30),transparent_45%),linear-gradient(145deg,#10262f,#173f4b)] text-white">
                <div className="text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/12 backdrop-blur"><Play size={32} fill="currentColor" className="ml-1" /></div>
                  <p className="mt-5 text-sm font-bold text-white/70">O vídeo ainda não foi vinculado a esta aula.</p>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/28 px-3 py-2 text-xs font-bold backdrop-blur"><LockKeyhole size={14} /> Acesso vinculado à matrícula</div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">{course.shortTitle} • {moduleTitle}</p>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">{lesson.title}</h1>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <LessonCompleteButton lessonId={lesson.id} initiallyCompleted={lesson.completed} />
              <button className="btn-secondary" disabled><FileDown size={18} /> Material da aula</button>
            </div>
          </div>

          <section className="card mt-6 p-5 sm:p-6">
            <h2 className="font-black">Sobre esta aula</h2>
            <p className="muted mt-3 text-sm leading-7">{lesson.description || "Assista ao conteúdo e marque a aula como concluída para atualizar seu progresso."}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f3ed] text-[#267155]"><ShieldCheck size={21} /></div>
              <div><p className="font-black">Conteúdo protegido</p><p className="muted text-xs">Link temporário e acesso individual</p></div>
            </div>
            <p className="muted mt-4 text-sm leading-6">O endereço do vídeo expira automaticamente e só é gerado para usuários com acesso ao curso.</p>
          </div>
          <div className="card p-5">
            <h2 className="font-black">Próxima etapa</h2>
            <p className="muted mt-3 text-sm leading-6">Conclua esta aula para atualizar automaticamente seu progresso no curso.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
