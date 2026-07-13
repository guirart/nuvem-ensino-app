import Link from "next/link";
import { BookOpen, Layers3, Plus, Upload, Video } from "lucide-react";
import { getAdminCatalog } from "@/lib/course-data";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const catalog = isSupabaseConfigured() ? await getAdminCatalog() : [];
  const moduleCount = catalog.reduce((sum, course) => sum + course.modules.length, 0);
  const lessonCount = catalog.reduce(
    (sum, course) => sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0),
    0,
  );
  const publishedCount = catalog.filter((course) => course.status === "published").length;

  const stats = [
    [BookOpen, "Cursos", String(catalog.length), `${publishedCount} publicados`],
    [Layers3, "Módulos", String(moduleCount), "Organização do conteúdo"],
    [Video, "Aulas", String(lessonCount), "Vídeos cadastrados"],
  ] as const;

  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Operação</p>
      <h1 className="page-title mt-2">Visão geral</h1>
      <p className="muted mt-3">Gerencie a biblioteca de cursos e envie novas aulas.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {stats.map(([Icon, label, value, detail]) => (
          <div key={label} className="card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><Icon size={22} /></div>
            <p className="muted mt-5 text-sm font-bold">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="muted mt-1 text-xs">{detail}</p>
          </div>
        ))}
      </div>

      <section className="card mt-6 p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Ação principal</p><h2 className="mt-2 text-xl font-black">Publicar uma nova aula</h2><p className="muted mt-2 max-w-xl text-sm leading-6">Crie o curso e o módulo, escolha o vídeo e acompanhe o progresso do upload.</p></div>
          <Link href="/admin/conteudo" className="btn-primary shrink-0"><Upload size={18} /> Abrir painel de aulas</Link>
        </div>
      </section>

      {catalog.length === 0 ? (
        <section className="card mt-6 p-6 text-center"><Plus className="mx-auto text-[var(--brand-dark)]" /><h2 className="mt-3 font-black">Comece pelo primeiro curso</h2><p className="muted mt-2 text-sm">O catálogo ainda está vazio.</p><Link href="/admin/conteudo" className="btn-primary mt-5">Criar conteúdo</Link></section>
      ) : null}
    </div>
  );
}
