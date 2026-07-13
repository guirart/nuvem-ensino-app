"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { AdminCourseRow, AdminEnrollmentRow, AdminStudentRow } from "@/lib/admin-data";

type Props = {
  enrollments: AdminEnrollmentRow[];
  students: AdminStudentRow[];
  courses: AdminCourseRow[];
};

const statusLabels: Record<AdminEnrollmentRow["status"], string> = {
  pending: "Pendente",
  active: "Ativa",
  completed: "Concluída",
  cancelled: "Cancelada",
  expired: "Expirada",
};

function toDateInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function EnrollmentsManager({ enrollments, students, courses }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminEnrollmentRow | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrollments.filter((enrollment) => {
      const matchesTerm = !term || [enrollment.studentName, enrollment.studentEmail, enrollment.courseTitle].some((value) => value.toLowerCase().includes(term));
      return matchesTerm && (status === "all" || enrollment.status === status);
    });
  }, [enrollments, search, status]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const editing = selected !== "new" && selected !== null;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(editing ? `/api/admin/enrollments/${selected.id}` : "/api/admin/enrollments", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.get("userId"),
          courseId: form.get("courseId"),
          status: form.get("status"),
          startsAt: form.get("startsAt"),
          expiresAt: form.get("expiresAt") || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a matrícula.");
      setSelected(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro ao salvar matrícula.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(enrollment: AdminEnrollmentRow) {
    if (!window.confirm(`Excluir a matrícula de ${enrollment.studentName} em ${enrollment.courseTitle}?`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir a matrícula.");
      setSelected(null);
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Erro ao excluir matrícula.");
    } finally {
      setBusy(false);
    }
  }

  const editing = selected && selected !== "new" ? selected : null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Acessos</p><h1 className="page-title mt-2">Matrículas</h1><p className="muted mt-3">Acesso, validade e progresso calculados a partir do banco real.</p></div><button onClick={() => { setError(""); setSelected("new"); }} className="btn-primary"><Plus size={18} /> Nova matrícula</button></div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83969b]" size={18} /><input className="input-field pl-10" placeholder="Buscar aluno ou curso" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select className="input-field sm:w-52" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>

      <div className="card mt-5 overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#f7f9f9] text-xs uppercase tracking-wider text-[#70858c]"><tr><th className="px-5 py-3">Aluno</th><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Validade</th><th className="px-5 py-3">Progresso</th><th className="px-5 py-3">Ação</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{filtered.map((row) => <tr key={row.id}><td className="px-5 py-4"><p className="font-bold">{row.studentName}</p><p className="muted mt-1 text-xs">{row.studentEmail}</p></td><td className="px-5 py-4">{row.courseTitle}</td><td className="px-5 py-4"><span className={`badge ${row.status === "active" ? "badge-brand" : row.status === "completed" ? "bg-emerald-50 text-emerald-700" : row.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{statusLabels[row.status]}</span></td><td className="px-5 py-4">{row.expiresAt ? new Intl.DateTimeFormat("pt-BR").format(new Date(row.expiresAt)) : "Sem expiração"}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-[#e5ecee]"><div className="h-full bg-[var(--brand)]" style={{ width: `${row.progress}%` }} /></div><div><strong>{row.progress}%</strong><p className="muted text-xs">{row.completedLessons}/{row.totalLessons} aulas</p></div></div></td><td className="px-5 py-4"><button onClick={() => { setError(""); setSelected(row); }} className="inline-flex items-center gap-2 font-extrabold text-[var(--brand-dark)]"><Pencil size={16} /> Gerenciar</button></td></tr>)}</tbody></table>{filtered.length === 0 ? <p className="p-6 text-sm text-[#647b83]">Nenhuma matrícula encontrada.</p> : null}</div>

      {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#10252d]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setSelected(null); }}><div className="card max-h-[92dvh] w-full max-w-xl overflow-y-auto p-5 sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">{selected === "new" ? "Novo acesso" : "Gerenciar acesso"}</p><h2 className="mt-1 text-2xl font-black">{selected === "new" ? "Criar matrícula" : editing?.studentName}</h2></div><button onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)]"><X size={19} /></button></div><form onSubmit={save} className="mt-6 space-y-4"><label className="block text-sm font-bold">Aluno<select name="userId" className="input-field mt-2" required defaultValue={editing?.userId || ""} disabled={Boolean(editing)}><option value="" disabled>Selecione</option>{students.filter((student) => student.role === "student").map((student) => <option key={student.id} value={student.id}>{student.fullName} — {student.email}</option>)}</select></label><label className="block text-sm font-bold">Curso<select name="courseId" className="input-field mt-2" required defaultValue={editing?.courseId || ""} disabled={Boolean(editing)}><option value="" disabled>Selecione</option>{courses.filter((course) => course.status !== "archived").map((course) => <option key={course.id} value={course.id}>{course.shortTitle}</option>)}</select></label><label className="block text-sm font-bold">Status<select name="status" className="input-field mt-2" defaultValue={editing?.status || "active"}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Início<input name="startsAt" type="date" className="input-field mt-2" defaultValue={toDateInput(editing?.startsAt || new Date().toISOString())} /></label><label className="block text-sm font-bold">Expiração opcional<input name="expiresAt" type="date" className="input-field mt-2" defaultValue={toDateInput(editing?.expiresAt || null)} /></label></div>{error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}<div className="flex flex-wrap gap-3"><button className="btn-primary" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={18} /> : <Plus size={18} />} Salvar matrícula</button>{editing ? <button type="button" onClick={() => remove(editing)} className="btn-secondary text-red-700" disabled={busy}><Trash2 size={18} /> Excluir matrícula</button> : null}</div></form></div></div> : null}
    </>
  );
}
