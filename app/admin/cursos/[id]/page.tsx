import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";
import { CourseStructureEditor } from "@/components/admin/course-structure-editor";
import { getAdminCourseEditorData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminCourseEditorData(id);
  if (!data) notFound();

  return (
    <div>
      <Link href="/admin/cursos" className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--brand-dark)]"><ArrowLeft size={17} /> Voltar para cursos</Link>
      <div className="mt-6"><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Editar curso</p><h1 className="page-title mt-2">{data.course.title}</h1><p className="muted mt-3">{data.course.activeEnrollments} matrícula(s) ativa(s) · {data.course.averageProgress}% de progresso médio.</p></div>
      <div className="mt-7"><CourseForm course={data.course} instructors={data.instructors} /></div>
      <CourseStructureEditor data={data} />
    </div>
  );
}
