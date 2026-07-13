import Link from "next/link";
import { CheckCircle2, FileText, Lock, PlayCircle, Radio } from "lucide-react";
import type { Module } from "@/lib/types";

function LessonIcon({ type, completed }: { type: string; completed: boolean }) {
  if (completed) return <CheckCircle2 size={20} className="text-[var(--success)]" />;
  if (type === "material") return <FileText size={20} />;
  if (type === "live") return <Radio size={20} />;
  return <PlayCircle size={20} />;
}

export function ModuleList({ modules }: { modules: Module[] }) {
  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <section key={module.id} className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Módulo {module.order}</p>
              <h2 className="mt-1 font-black">{module.title}</h2>
            </div>
            {!module.released ? <span className="badge bg-[#eef1f2] text-[#667b82]"><Lock size={13} /> {module.releaseLabel}</span> : null}
          </div>
          <div className="divide-y divide-[var(--line)]">
            {module.lessons.map((lesson, index) => {
              const content = (
                <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#f8fbfb]">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${lesson.locked ? "bg-[#eef1f2] text-[#83949a]" : "bg-[var(--brand-pale)] text-[var(--brand-dark)]"}`}>
                    {lesson.locked ? <Lock size={18} /> : <LessonIcon type={lesson.type} completed={lesson.completed} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#81949a]">Aula {index + 1}</p>
                    <p className="mt-1 font-bold leading-5">{lesson.title}</p>
                  </div>
                  <span className="muted hidden text-xs font-bold sm:block">{lesson.duration}</span>
                </div>
              );

              return lesson.locked ? <div key={lesson.id}>{content}</div> : <Link key={lesson.id} href={`/aluno/aulas/${lesson.id}`}>{content}</Link>;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
