"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Save, Trash2, Upload, X } from "lucide-react";
import type { AdminCourseEditorData } from "@/lib/admin-data";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function CourseStructureEditor({ data }: { data: AdminCourseEditorData }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function saveModule(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          position: Number(form.get("position") || 1),
          releaseAt: form.get("releaseAt") || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao salvar módulo.");
      setEditing(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro ao salvar módulo.");
    } finally {
      setBusy(null);
    }
  }

  async function saveLesson(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          position: Number(form.get("position") || 1),
          durationMinutes: Number(form.get("durationMinutes") || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao salvar aula.");
      setEditing(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro ao salvar aula.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(kind: "modules" | "lessons", id: string, label: string) {
    if (!window.confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir.");
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Erro ao excluir.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Estrutura</p>
          <h2 className="mt-1 text-2xl font-black">Módulos e aulas</h2>
        </div>
        <Link href="/admin/conteudo" className="btn-primary">
          <Upload size={18} /> Adicionar módulo ou aula
        </Link>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

      <div className="mt-5 space-y-4">
        {data.modules.length === 0 ? (
          <div className="card p-6 text-sm text-[#647b83]">Este curso ainda não possui módulos.</div>
        ) : (
          data.modules.map((module) => (
            <article key={module.id} className="card overflow-hidden">
              {editing === `module-${module.id}` ? (
                <form onSubmit={(event) => saveModule(event, module.id)} className="border-b border-[var(--line)] p-5">
                  <div className="grid gap-3 sm:grid-cols-[1fr_110px_220px_auto]">
                    <input name="title" className="input-field" defaultValue={module.title} required />
                    <input name="position" className="input-field" type="number" min="1" defaultValue={module.position} />
                    <input name="releaseAt" className="input-field" type="datetime-local" defaultValue={toLocalInput(module.releaseAt)} />
                    <div className="flex gap-2">
                      <button className="btn-primary px-3" disabled={busy === module.id} aria-label="Salvar módulo">
                        {busy === module.id ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn-secondary px-3" aria-label="Cancelar">
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Módulo {module.position}</p>
                    <h3 className="mt-1 font-black">{module.title}</h3>
                    <p className="muted mt-1 text-xs">
                      {module.releaseAt ? `Liberação: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(module.releaseAt))}` : "Liberação imediata"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(`module-${module.id}`)} className="btn-secondary px-3" aria-label="Editar módulo"><Pencil size={17} /></button>
                    <button onClick={() => remove("modules", module.id, `o módulo “${module.title}” e suas aulas`)} className="btn-secondary px-3 text-red-700" disabled={busy === module.id} aria-label="Excluir módulo"><Trash2 size={17} /></button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-[var(--line)]">
                {module.lessons.length === 0 ? (
                  <p className="p-5 text-sm text-[#647b83]">Nenhuma aula neste módulo.</p>
                ) : (
                  module.lessons.map((lesson) =>
                    editing === `lesson-${lesson.id}` ? (
                      <form key={lesson.id} onSubmit={(event) => saveLesson(event, lesson.id)} className="p-5">
                        <div className="grid gap-3 lg:grid-cols-[90px_1fr_130px_auto]">
                          <input name="position" className="input-field" type="number" min="1" defaultValue={lesson.position} />
                          <input name="title" className="input-field" defaultValue={lesson.title} required />
                          <input name="durationMinutes" className="input-field" type="number" min="0" step="0.1" defaultValue={Math.round(lesson.durationSeconds / 6) / 10} />
                          <div className="flex gap-2">
                            <button className="btn-primary px-3" disabled={busy === lesson.id} aria-label="Salvar aula">
                              {busy === lesson.id ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
                            </button>
                            <button type="button" onClick={() => setEditing(null)} className="btn-secondary px-3" aria-label="Cancelar"><X size={17} /></button>
                          </div>
                        </div>
                        <textarea name="description" className="input-field mt-3 min-h-20" defaultValue={lesson.description || ""} placeholder="Descrição da aula" />
                      </form>
                    ) : (
                      <div key={lesson.id} className="flex items-center gap-3 p-5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-pale)] text-sm font-black text-[var(--brand-dark)]">{lesson.position}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{lesson.title}</p>
                          <p className="muted mt-1 text-xs">{Math.round(lesson.durationSeconds / 60)} min · {lesson.videoStoragePath ? "vídeo disponível" : "sem vídeo"}</p>
                        </div>
                        <button onClick={() => setEditing(`lesson-${lesson.id}`)} className="btn-secondary px-3" aria-label="Editar aula"><Pencil size={17} /></button>
                        <button onClick={() => remove("lessons", lesson.id, `a aula “${lesson.title}”`)} className="btn-secondary px-3 text-red-700" disabled={busy === lesson.id} aria-label="Excluir aula"><Trash2 size={17} /></button>
                      </div>
                    ),
                  )
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
