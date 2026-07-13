import { Plus } from "lucide-react";
import { courses } from "@/lib/demo-data";

export default function AdminCoursesPage() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Catálogo</p><h1 className="page-title mt-2">Cursos</h1></div><button className="btn-primary"><Plus size={18} /> Novo curso</button></div>
      <div className="card mt-7 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Professor</th><th className="px-5 py-3">Carga horária</th><th className="px-5 py-3">Progresso médio</th><th className="px-5 py-3">Ações</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{courses.map((course) => <tr key={course.id}><td className="px-5 py-4 font-bold">{course.shortTitle}</td><td className="px-5 py-4">{course.instructor}</td><td className="px-5 py-4">{course.duration}</td><td className="px-5 py-4">{course.progress}%</td><td className="px-5 py-4"><button className="font-extrabold text-[var(--brand-dark)]">Editar</button></td></tr>)}</tbody></table></div>
    </div>
  );
}
