import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCatalog } from "@/lib/course-data";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = isSupabaseConfigured() ? await getAdminCatalog() : [];

  return (
    <div>
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Catálogo</p><h1 className="page-title mt-2">Cursos</h1></div><Link href="/admin/conteudo" className="btn-primary"><Plus size={18} /> Novo curso</Link></div>
      <div className="card mt-7 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Módulos</th><th className="px-5 py-3">Aulas</th><th className="px-5 py-3">Carga horária</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{courses.map((course) => { const lessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0); return <tr key={course.id}><td className="px-5 py-4 font-bold">{course.shortTitle || course.title}</td><td className="px-5 py-4">{course.modules.length}</td><td className="px-5 py-4">{lessons}</td><td className="px-5 py-4">{Math.round(course.workloadMinutes / 60)} h</td><td className="px-5 py-4"><span className={`badge ${course.status === "published" ? "badge-brand" : "bg-[#eef1f2] text-[#667b82]"}`}>{course.status === "published" ? "Publicado" : "Rascunho"}</span></td></tr>; })}</tbody></table>{courses.length === 0 ? <p className="p-6 text-sm text-[#647b83]">Nenhum curso cadastrado.</p> : null}</div>
    </div>
  );
}
