"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, LoaderCircle, Save } from "lucide-react";
import type { AdminCourseRow } from "@/lib/admin-data";

type Instructor = { id: string; fullName: string; email: string };

type Props = {
  course?: AdminCourseRow;
  instructors: Instructor[];
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CourseForm({ course, instructors }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"save" | "archive" | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(course?.title || "");
  const [slug, setSlug] = useState(course?.slug || "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save");
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      shortTitle: String(form.get("shortTitle") || ""),
      slug: String(form.get("slug") || ""),
      description: String(form.get("description") || ""),
      workloadMinutes: Number(form.get("workloadMinutes") || 0),
      status: String(form.get("status") || "draft"),
      instructorIds: form.getAll("instructorIds").map(String),
    };

    try {
      const response = await fetch(course ? `/api/admin/courses/${course.id}` : "/api/admin/courses", {
        method: course ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o curso.");
      if (course) {
        router.refresh();
      } else {
        router.push(`/admin/cursos/${result.id}`);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar curso.");
    } finally {
      setBusy(null);
    }
  }

  async function archiveCourse() {
    if (!course || !window.confirm("Arquivar este curso? Ele deixará de aparecer para novos alunos.")) return;
    setBusy("archive");
    setError("");
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível arquivar o curso.");
      router.push("/admin/cursos");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Erro ao arquivar curso.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-7">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block text-sm font-bold">
          Título do curso
          <input
            name="title"
            required
            className="input-field mt-2"
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!course && (!slug || slug === slugify(title))) setSlug(slugify(value));
            }}
          />
        </label>
        <label className="block text-sm font-bold">
          Nome curto
          <input name="shortTitle" className="input-field mt-2" defaultValue={course?.shortTitle || ""} />
        </label>
        <label className="block text-sm font-bold">
          Endereço interno (slug)
          <input
            name="slug"
            required
            className="input-field mt-2"
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
          />
        </label>
        <label className="block text-sm font-bold">
          Carga horária em minutos
          <input
            name="workloadMinutes"
            type="number"
            min="0"
            className="input-field mt-2"
            defaultValue={course?.workloadMinutes || 0}
          />
        </label>
        <label className="block text-sm font-bold">
          Status
          <select name="status" className="input-field mt-2" defaultValue={course?.status || "draft"}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </label>
        <fieldset className="rounded-2xl border border-[var(--line)] p-4">
          <legend className="px-1 text-sm font-bold">Professor responsável</legend>
          <div className="mt-2 max-h-36 space-y-2 overflow-auto">
            {instructors.length === 0 ? (
              <p className="muted text-sm">Cadastre um usuário como professor na área de alunos.</p>
            ) : (
              instructors.map((instructor) => (
                <label key={instructor.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="instructorIds"
                    value={instructor.id}
                    defaultChecked={course?.instructorIds.includes(instructor.id)}
                    className="mt-1"
                  />
                  <span>
                    <strong>{instructor.fullName}</strong>
                    <span className="muted block text-xs">{instructor.email}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </fieldset>
        <label className="block text-sm font-bold lg:col-span-2">
          Descrição
          <textarea
            name="description"
            className="input-field mt-2 min-h-32 resize-y"
            defaultValue={course?.description || ""}
          />
        </label>
      </div>

      {error ? <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy !== null}>
          {busy === "save" ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
          {course ? "Salvar alterações" : "Criar curso"}
        </button>
        {course && course.status !== "archived" ? (
          <button type="button" onClick={archiveCourse} className="btn-secondary text-red-700" disabled={busy !== null}>
            {busy === "archive" ? <LoaderCircle className="animate-spin" size={18} /> : <Archive size={18} />}
            Arquivar curso
          </button>
        ) : null}
      </div>
    </form>
  );
}
