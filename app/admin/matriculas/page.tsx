import { Plus } from "lucide-react";

const enrollments = [
  ["Dra. Marina Souza", "Aperfeiçoamento em DICI", "Ativa", "12/07/2026"],
  ["Dr. Carlos Mendonça", "Microbiota na Prática", "Ativa", "08/07/2026"],
  ["Dra. Helena Prado", "Teste Respiratório H₂ e CH₄", "Concluída", "02/07/2026"],
  ["Dr. Bruno Azevedo", "Aperfeiçoamento em DICI", "Pendente", "13/07/2026"],
];

export default function AdminEnrollmentsPage() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Acessos</p><h1 className="page-title mt-2">Matrículas</h1></div><button className="btn-primary"><Plus size={18} /> Nova matrícula</button></div>
      <div className="card mt-7 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Aluno</th><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Data</th><th className="px-5 py-3">Ação</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{enrollments.map((row) => <tr key={`${row[0]}-${row[1]}`}><td className="px-5 py-4 font-bold">{row[0]}</td><td className="px-5 py-4">{row[1]}</td><td className="px-5 py-4"><span className={`badge ${row[2] === "Ativa" ? "badge-brand" : row[2] === "Concluída" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row[2]}</span></td><td className="px-5 py-4">{row[3]}</td><td className="px-5 py-4"><button className="font-extrabold text-[var(--brand-dark)]">Gerenciar</button></td></tr>)}</tbody></table></div>
    </div>
  );
}
