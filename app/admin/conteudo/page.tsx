import { ContentManager } from "@/components/admin/content-manager";
import { getAdminCatalog } from "@/lib/course-data";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const configured = isSupabaseConfigured();
  const catalog = configured ? await getAdminCatalog() : [];

  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Biblioteca</p>
      <h1 className="page-title mt-2">Aulas e conteúdo</h1>
      <p className="muted mt-3 max-w-3xl leading-7">
        Crie o curso, organize os módulos e envie os vídeos diretamente pelo painel administrativo.
      </p>
      <div className="mt-7"><ContentManager catalog={catalog} configured={configured} /></div>
    </div>
  );
}
