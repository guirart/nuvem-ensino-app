import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";
import { getAdminStudents } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const users = await getAdminStudents();
  const instructors = users
    .filter((user) => user.role === "instructor" || user.role === "admin")
    .map((user) => ({ id: user.id, fullName: user.fullName, email: user.email }));

  return (
    <div>
      <Link href="/admin/cursos" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--brand-dark)]"><ArrowLeft size={17} /> Voltar para cursos</Link>
      <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Catálogo</p><h1 className="page-title mt-2">Novo curso</h1><p className="muted mt-3 mb-7">Cadastre os dados oficiais que serão exibidos para os alunos.</p>
      <CourseForm instructors={instructors} />
    </div>
  );
}
