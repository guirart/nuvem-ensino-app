import Link from "next/link";
import { Activity, BookOpen, GraduationCap, Layers3, Plus, Upload, UsersRound, Video } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin-data";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const data = isSupabaseConfigured()
    ? await getAdminDashboardData()
    : {
        stats: { courses: 0, publishedCourses: 0, modules: 0, lessons: 0, students: 0, activeEnrollments: 0, completedEnrollments: 0, averageProgress: 0 },
        recentActivity: [],
      };

  const stats = [
    [BookOpen, "Cursos", String(data.stats.courses), `${data.stats.publishedCourses} publicados`],
    [UsersRound, "Alunos", String(data.stats.students), "Contas de alunos"],
    [GraduationCap, "Matrículas ativas", String(data.stats.activeEnrollments), `${data.stats.completedEnrollments} concluídas`],
    [Video, "Aulas", String(data.stats.lessons), `${data.stats.modules} módulos`],
    [Activity, "Progresso médio", `${data.stats.averageProgress}%`, "Matrículas ativas e concluídas"],
  ] as const;

  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Operação</p>
      <h1 className="page-title mt-2">Visão geral</h1>
      <p className="muted mt-3">Os números abaixo são calculados diretamente a partir do Supabase.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([Icon, label, value, detail]) => (
          <div key={label} className="card p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><Icon size={22} /></div>
            <p className="muted mt-5 text-sm font-bold">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="muted mt-1 text-xs">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Atividade real</p><h2 className="mt-2 text-xl font-black">Últimas movimentações</h2></div></div>
          <div className="mt-5 divide-y divide-[var(--line)]">
            {data.recentActivity.length === 0 ? <p className="py-5 text-sm text-[#647b83]">Ainda não há matrículas ou aulas registradas.</p> : data.recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3 py-4"><div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]">{item.type === "lesson" ? <Video size={17} /> : <GraduationCap size={17} />}</div><div className="min-w-0 flex-1"><p className="font-bold">{item.title}</p><p className="muted mt-1 text-sm">{item.detail}</p></div><time className="muted shrink-0 text-xs">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(item.occurredAt))}</time></div>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Ações rápidas</p>
          <h2 className="mt-2 text-xl font-black">Administrar plataforma</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/cursos/novo" className="btn-primary justify-start"><Plus size={18} /> Criar curso</Link>
            <Link href="/admin/conteudo" className="btn-secondary justify-start"><Upload size={18} /> Enviar aula</Link>
            <Link href="/admin/alunos" className="btn-secondary justify-start"><UsersRound size={18} /> Cadastrar aluno</Link>
            <Link href="/admin/matriculas" className="btn-secondary justify-start"><GraduationCap size={18} /> Criar matrícula</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
