import { Search, UserPlus } from "lucide-react";

const students = [
  ["Dra. Marina Souza", "marina@exemplo.com", "CRM-MG 45821", "2 cursos"],
  ["Dr. Carlos Mendonça", "carlos@exemplo.com", "CRM-SP 182734", "1 curso"],
  ["Dra. Helena Prado", "helena@exemplo.com", "CRM-RJ 114902", "3 cursos"],
  ["Dr. Bruno Azevedo", "bruno@exemplo.com", "CRM-MG 77120", "1 curso"],
];

export default function AdminStudentsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Pessoas</p><h1 className="page-title mt-2">Alunos</h1></div><button className="btn-primary"><UserPlus size={18} /> Novo aluno</button></div>
      <label className="relative mt-6 block max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83969b]" size={18} /><input className="input-field pl-10" placeholder="Buscar por nome, e-mail ou CRM" /></label>
      <div className="card mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Registro</th><th className="px-5 py-3">Matrículas</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{students.map((student) => <tr key={student[1]}><td className="px-5 py-4 font-bold">{student[0]}</td><td className="px-5 py-4">{student[1]}</td><td className="px-5 py-4">{student[2]}</td><td className="px-5 py-4">{student[3]}</td></tr>)}</tbody></table></div>
    </div>
  );
}
