import { BookOpen, CircleDollarSign, GraduationCap, TrendingUp, UsersRound } from "lucide-react";
import { courses } from "@/lib/demo-data";

const stats = [
  [UsersRound, "Alunos ativos", "487", "+18 no mês"],
  [GraduationCap, "Matrículas", "536", "92% ativas"],
  [BookOpen, "Cursos publicados", String(courses.length), "2 em produção"],
  [CircleDollarSign, "Receita do mês", "R$ 84.920", "+12,4%"],
] as const;

export default function AdminDashboard() {
  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Operação</p>
      <h1 className="page-title mt-2">Visão geral</h1>
      <p className="muted mt-3">Indicadores demonstrativos da plataforma de ensino.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([Icon, label, value, detail]) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><Icon size={22} /></div><TrendingUp size={18} className="text-[var(--success)]" /></div>
            <p className="muted mt-5 text-sm font-bold">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="muted mt-1 text-xs">{detail}</p>
          </div>
        ))}
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-black">Cursos com maior atividade</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Alunos</th><th className="px-5 py-3">Conclusão média</th><th className="px-5 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-[var(--line)]">{courses.map((course, index) => <tr key={course.id}><td className="px-5 py-4 font-bold">{course.shortTitle}</td><td className="px-5 py-4">{210 - index * 53}</td><td className="px-5 py-4">{course.progress}%</td><td className="px-5 py-4"><span className="badge badge-brand">Publicado</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
