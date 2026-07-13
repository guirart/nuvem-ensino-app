"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Search, Trash2, UserPlus, X } from "lucide-react";
import type { AdminStudentRow } from "@/lib/admin-data";

function roleLabel(role: AdminStudentRow["role"]) {
  if (role === "admin") return "Administrador";
  if (role === "instructor") return "Professor";
  return "Aluno";
}

export function StudentsManager({ students }: { students: AdminStudentRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [selected, setSelected] = useState<AdminStudentRow | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesTerm = !term || [student.fullName, student.email, student.crm, student.specialty].some((value) => value.toLowerCase().includes(term));
      return matchesTerm && (role === "all" || student.role === role);
    });
  }, [students, search, role]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const editing = selected !== "new" && selected !== null;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(editing ? `/api/admin/students/${selected.id}` : "/api/admin/students", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          password: form.get("password"),
          crm: form.get("crm"),
          phone: form.get("phone"),
          specialty: form.get("specialty"),
          role: form.get("role"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o usuário.");
      setSelected(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro ao salvar usuário.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(student: AdminStudentRow) {
    if (!window.confirm(`Excluir a conta de ${student.fullName}? Matrículas e progresso vinculados também serão removidos.`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir a conta.");
      setSelected(null);
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Erro ao excluir usuário.");
    } finally {
      setBusy(false);
    }
  }

  const editingStudent = selected && selected !== "new" ? selected : null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Pessoas</p><h1 className="page-title mt-2">Alunos e equipe</h1><p className="muted mt-3">Dados reais das contas cadastradas no Supabase.</p></div>
        <button onClick={() => { setError(""); setSelected("new"); }} className="btn-primary"><UserPlus size={18} /> Novo usuário</button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83969b]" size={18} /><input className="input-field pl-10" placeholder="Buscar por nome, e-mail, CRM ou especialidade" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select className="input-field sm:w-52" value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Todos os perfis</option><option value="student">Alunos</option><option value="instructor">Professores</option><option value="admin">Administradores</option></select>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">Contato</th><th className="px-5 py-3">Registro</th><th className="px-5 py-3">Perfil</th><th className="px-5 py-3">Matrículas</th><th className="px-5 py-3">Progresso médio</th><th className="px-5 py-3">Ações</th></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((student) => (
              <tr key={student.id}>
                <td className="px-5 py-4"><p className="font-bold">{student.fullName}</p><p className="muted mt-1 text-xs">{student.specialty || "Especialidade não informada"}</p></td>
                <td className="px-5 py-4"><p>{student.email}</p><p className="muted mt-1 text-xs">{student.phone || "Telefone não informado"}</p></td>
                <td className="px-5 py-4">{student.crm || "—"}</td>
                <td className="px-5 py-4"><span className={`badge ${student.role === "admin" ? "bg-[#f4ecff] text-[#6d3e91]" : student.role === "instructor" ? "bg-amber-50 text-amber-800" : "badge-brand"}`}>{roleLabel(student.role)}</span></td>
                <td className="px-5 py-4"><strong>{student.activeEnrollmentCount}</strong> ativa(s)<p className="muted mt-1 text-xs">{student.enrollmentCount} no total</p></td>
                <td className="px-5 py-4"><strong>{student.averageProgress}%</strong></td>
                <td className="px-5 py-4"><button onClick={() => { setError(""); setSelected(student); }} className="inline-flex items-center gap-2 font-extrabold text-[var(--brand-dark)]"><Pencil size={16} /> Gerenciar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="p-6 text-sm text-[#647b83]">Nenhum usuário encontrado.</p> : null}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#10252d]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setSelected(null); }}>
          <div className="card max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">{selected === "new" ? "Nova conta" : "Gerenciar conta"}</p><h2 className="mt-1 text-2xl font-black">{selected === "new" ? "Cadastrar usuário" : editingStudent?.fullName}</h2></div><button onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)]" aria-label="Fechar"><X size={19} /></button></div>
            <form onSubmit={save} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold sm:col-span-2">Nome completo<input name="fullName" required className="input-field mt-2" defaultValue={editingStudent?.fullName || ""} /></label>
                <label className="block text-sm font-bold">E-mail<input name="email" type="email" required className="input-field mt-2" defaultValue={editingStudent?.email || ""} /></label>
                <label className="block text-sm font-bold">{editingStudent ? "Nova senha (opcional)" : "Senha temporária"}<input name="password" type="password" minLength={editingStudent ? 0 : 8} required={!editingStudent} className="input-field mt-2" placeholder={editingStudent ? "Deixe vazio para manter" : "Mínimo de 8 caracteres"} /></label>
                <label className="block text-sm font-bold">CRM/registro<input name="crm" className="input-field mt-2" defaultValue={editingStudent?.crm || ""} /></label>
                <label className="block text-sm font-bold">Telefone<input name="phone" className="input-field mt-2" defaultValue={editingStudent?.phone || ""} /></label>
                <label className="block text-sm font-bold">Especialidade<input name="specialty" className="input-field mt-2" defaultValue={editingStudent?.specialty || ""} /></label>
                <label className="block text-sm font-bold">Perfil<select name="role" className="input-field mt-2" defaultValue={editingStudent?.role || "student"}><option value="student">Aluno</option><option value="instructor">Professor</option><option value="admin">Administrador</option></select></label>
              </div>
              {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3"><button className="btn-primary" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={18} /> : <UserPlus size={18} />} Salvar usuário</button>{editingStudent ? <button type="button" onClick={() => remove(editingStudent)} className="btn-secondary text-red-700" disabled={busy}><Trash2 size={18} /> Excluir conta</button> : null}</div>
              {selected === "new" ? <p className="muted mt-4 text-xs leading-5">O usuário poderá entrar imediatamente com o e-mail e a senha temporária. Para criar contas por este painel, configure a variável privada SUPABASE_SECRET_KEY na Vercel.</p> : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
