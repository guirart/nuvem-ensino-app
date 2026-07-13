import Link from "next/link";
import { Plus } from "lucide-react";
import { CoursesTable } from "@/components/admin/courses-table";
import { getAdminCourses } from "@/lib/admin-data";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = isSupabaseConfigured() ? await getAdminCourses() : [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Catálogo</p><h1 className="page-title mt-2">Cursos</h1><p className="muted mt-3">Progresso, estrutura e matrículas calculados com os registros reais.</p></div><Link href="/admin/cursos/novo" className="btn-primary"><Plus size={18} /> Novo curso</Link></div>
      <CoursesTable courses={courses} />
    </div>
  );
}
