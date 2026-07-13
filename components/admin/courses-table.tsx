"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Search } from "lucide-react";
import type { AdminCourseRow } from "@/lib/admin-data";

export function CoursesTable({ courses }: { courses: AdminCourseRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesTerm = !term || [course.title, course.shortTitle, course.professor].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = status === "all" || course.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [courses, search, status]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83969b]" size={18} />
          <input className="input-field pl-10" placeholder="Buscar curso ou professor" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <select className="input-field sm:w-52" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
          <option value="archived">Arquivados</option>
        </select>
      </div>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]">
            <tr><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Professor</th><th className="px-5 py-3">Estrutura</th><th className="px-5 py-3">Matrículas ativas</th><th className="px-5 py-3">Progresso médio</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((course) => (
              <tr key={course.id}>
                <td className="px-5 py-4"><p className="font-bold">{course.shortTitle}</p><p className="muted mt-1 text-xs">{Math.round(course.workloadMinutes / 60)} h de carga horária</p></td>
                <td className="px-5 py-4">{course.professor}</td>
                <td className="px-5 py-4">{course.moduleCount} módulo(s) · {course.lessonCount} aula(s)</td>
                <td className="px-5 py-4 font-bold">{course.activeEnrollments}</td>
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-[#e5ecee]"><div className="h-full bg-[var(--brand)]" style={{ width: `${course.averageProgress}%` }} /></div><strong>{course.averageProgress}%</strong></div></td>
                <td className="px-5 py-4"><span className={`badge ${course.status === "published" ? "badge-brand" : course.status === "archived" ? "bg-red-50 text-red-700" : "bg-[#eef1f2] text-[#667b82]"}`}>{course.status === "published" ? "Publicado" : course.status === "archived" ? "Arquivado" : "Rascunho"}</span></td>
                <td className="px-5 py-4"><Link href={`/admin/cursos/${course.id}`} className="inline-flex items-center gap-2 font-extrabold text-[var(--brand-dark)]"><Pencil size={16} /> Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="p-6 text-sm text-[#647b83]">Nenhum curso encontrado.</p> : null}
      </div>
    </>
  );
}
