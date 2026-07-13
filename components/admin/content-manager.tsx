"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Video, BookPlus, Layers3, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Upload as TusUpload } from "tus-js-client";
import { createClient } from "@/lib/supabase/client";
import type { AdminCourse } from "@/lib/course-data";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFileName(value: string) {
  const extension = value.includes(".") ? `.${value.split(".").pop()}` : ".mp4";
  const base = value.replace(/\.[^/.]+$/, "");
  return `${slugify(base) || "aula"}${extension.toLowerCase()}`;
}


function uploadVideoResumable({
  file,
  bucketName,
  objectName,
  accessToken,
  onProgress,
}: {
  file: File;
  bucketName: string;
  objectName: string;
  accessToken: string;
  onProgress: (percentage: number) => void;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");

  const projectId = new URL(supabaseUrl).hostname.split(".")[0];

  return new Promise<void>((resolve, reject) => {
    const upload = new TusUpload(file, {
      endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName,
        objectName,
        contentType: file.type || "video/mp4",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError(error: Error) {
        reject(error);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        resolve();
      },
    });

    upload.findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
        upload.start();
      })
      .catch(reject);
  });
}

type Feedback = { type: "success" | "error"; message: string } | null;

export function ContentManager({
  catalog,
  configured,
}: {
  catalog: AdminCourse[];
  configured: boolean;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(catalog[0]?.id || "");
  const [moduleId, setModuleId] = useState(catalog[0]?.modules[0]?.id || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [busy, setBusy] = useState<"course" | "module" | "lesson" | "delete" | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const selectedCourse = catalog.find((course) => course.id === courseId);
  const availableModules = useMemo(() => selectedCourse?.modules || [], [selectedCourse]);

  useEffect(() => {
    if (!catalog.length) {
      setCourseId("");
      setModuleId("");
      return;
    }

    const course = catalog.find((item) => item.id === courseId) || catalog[0];
    if (course.id !== courseId) setCourseId(course.id);
    if (!course.modules.some((module) => module.id === moduleId)) {
      setModuleId(course.modules[0]?.id || "");
    }
  }, [catalog, courseId, moduleId]);

  function refreshWithMessage(message: string) {
    setFeedback({ type: "success", message });
    router.refresh();
  }

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setBusy("course");

    const formElement = event.currentTarget;

    try {
      const form = new FormData(formElement);
      const title = String(form.get("title") || "").trim();
      const slug = slugify(String(form.get("slug") || title));
      if (!title || !slug) throw new Error("Informe o título do curso.");

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          shortTitle: String(form.get("shortTitle") || "").trim() || title,
          description: String(form.get("description") || "").trim() || null,
          workloadMinutes: Number(form.get("workloadMinutes") || 0),
          status: String(form.get("status") || "draft"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao criar curso.");

      formElement.reset();
      refreshWithMessage("Curso criado. Agora crie um módulo para ele.");
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Erro ao criar curso." });
    } finally {
      setBusy(null);
    }
  }

  async function createModule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setBusy("module");

    const formElement = event.currentTarget;

    try {
      const form = new FormData(formElement);
      const targetCourseId = String(form.get("courseId") || "");
      const title = String(form.get("title") || "").trim();
      if (!targetCourseId || !title) throw new Error("Escolha o curso e informe o módulo.");

      const releaseValue = String(form.get("releaseAt") || "");
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: targetCourseId,
          title,
          position: Number(form.get("position") || 1),
          releaseAt: releaseValue || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao criar módulo.");

      formElement.reset();
      refreshWithMessage("Módulo criado. Ele já pode receber aulas.");
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Erro ao criar módulo." });
    } finally {
      setBusy(null);
    }
  }

  async function createLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setUploadProgress(0);
    setBusy("lesson");

    let uploadedPath: string | null = null;
    const formElement = event.currentTarget;

    try {
      const form = new FormData(formElement);
      const targetCourseId = String(form.get("courseId") || "");
      const targetModuleId = String(form.get("moduleId") || "");
      const title = String(form.get("title") || "").trim();
      const file = form.get("video");

      if (!targetCourseId || !targetModuleId || !title) {
        throw new Error("Escolha o curso, o módulo e informe o título da aula.");
      }
      if (!(file instanceof File) || file.size === 0) throw new Error("Selecione o vídeo da aula.");
      if (!file.type.startsWith("video/")) throw new Error("O arquivo selecionado não é um vídeo.");

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sua sessão expirou. Entre novamente.");

      uploadedPath = `${targetCourseId}/${targetModuleId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      await uploadVideoResumable({
        file,
        bucketName: "course-videos",
        objectName: uploadedPath,
        accessToken: session.access_token,
        onProgress: setUploadProgress,
      });

      const durationMinutes = Number(form.get("durationMinutes") || 0);
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: targetModuleId,
          title,
          description: String(form.get("description") || "").trim() || null,
          position: Number(form.get("position") || 1),
          durationMinutes,
          videoStoragePath: uploadedPath,
          isPreview: Boolean(form.get("isPreview")),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        await supabase.storage.from("course-videos").remove([uploadedPath]);
        throw new Error(result.error || "Erro ao registrar aula.");
      }

      formElement.reset();
      setUploadProgress(100);
      refreshWithMessage("Aula enviada e publicada no módulo selecionado.");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível enviar a aula.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function deleteLesson(lessonId: string, storagePath: string | null) {
    if (!window.confirm("Excluir esta aula? O vídeo também será removido.")) return;

    setFeedback(null);
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao excluir aula.");
      refreshWithMessage("Aula excluída.");
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Erro ao excluir aula." });
    } finally {
      setBusy(null);
    }
  }

  if (!configured) {
    return (
      <div className="card mt-7 border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3 text-amber-800"><AlertTriangle className="shrink-0" /><div><h2 className="font-black">Supabase ainda não configurado</h2><p className="mt-2 text-sm leading-6">O painel de upload só é ativado depois que as variáveis do Supabase forem adicionadas na Vercel e o arquivo SQL de integração for executado.</p></div></div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {feedback ? (
        <div className={`rounded-2xl border p-4 text-sm font-bold ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          <div className="flex items-center gap-2">{feedback.type === "success" ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}{feedback.message}</div>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        <form onSubmit={createCourse} className="card p-5 sm:p-6">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><BookPlus size={22} /></div><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Etapa 1</p><h2 className="font-black">Criar curso</h2></div></div>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-bold">Título<input name="title" required className="input-field mt-2" placeholder="Ex.: Atualização em DICI" /></label>
            <label className="block text-sm font-bold">Nome curto<input name="shortTitle" className="input-field mt-2" placeholder="Ex.: DICI" /></label>
            <label className="block text-sm font-bold">Slug opcional<input name="slug" className="input-field mt-2" placeholder="atualizacao-em-dici" /></label>
            <label className="block text-sm font-bold">Descrição<textarea name="description" className="input-field mt-2 min-h-24 resize-y" /></label>
            <label className="block text-sm font-bold">Carga horária em minutos<input name="workloadMinutes" type="number" min="0" className="input-field mt-2" defaultValue="0" /></label>
            <label className="block text-sm font-bold">Status<select name="status" className="input-field mt-2" defaultValue="draft"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
          </div>
          <button disabled={busy !== null} className="btn-primary mt-5 w-full"><BookPlus size={18} /> {busy === "course" ? "Criando..." : "Criar curso"}</button>
        </form>

        <form onSubmit={createModule} className="card p-5 sm:p-6">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><Layers3 size={22} /></div><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Etapa 2</p><h2 className="font-black">Criar módulo</h2></div></div>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-bold">Curso<select name="courseId" required className="input-field mt-2" defaultValue=""><option value="" disabled>Selecione</option>{catalog.map((course) => <option key={course.id} value={course.id}>{course.shortTitle || course.title}</option>)}</select></label>
            <label className="block text-sm font-bold">Nome do módulo<input name="title" required className="input-field mt-2" placeholder="Ex.: Fundamentos" /></label>
            <label className="block text-sm font-bold">Ordem<input name="position" type="number" min="1" className="input-field mt-2" defaultValue="1" /></label>
            <label className="block text-sm font-bold">Data de liberação opcional<input name="releaseAt" type="datetime-local" className="input-field mt-2" /></label>
          </div>
          <button disabled={busy !== null || catalog.length === 0} className="btn-primary mt-5 w-full"><Layers3 size={18} /> {busy === "module" ? "Criando..." : "Criar módulo"}</button>
        </form>

        <form onSubmit={createLesson} className="card p-5 sm:p-6">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand-dark)]"><Video size={22} /></div><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Etapa 3</p><h2 className="font-black">Enviar aula</h2></div></div>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-bold">Curso<select name="courseId" required value={courseId} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { const value = event.target.value; setCourseId(value); const course = catalog.find((item) => item.id === value); setModuleId(course?.modules[0]?.id || ""); }} className="input-field mt-2"><option value="" disabled>Selecione</option>{catalog.map((course) => <option key={course.id} value={course.id}>{course.shortTitle || course.title}</option>)}</select></label>
            <label className="block text-sm font-bold">Módulo<select name="moduleId" required value={moduleId} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setModuleId(event.target.value)} className="input-field mt-2"><option value="" disabled>Selecione</option>{availableModules.map((module) => <option key={module.id} value={module.id}>{module.position}. {module.title}</option>)}</select></label>
            <label className="block text-sm font-bold">Título da aula<input name="title" required className="input-field mt-2" /></label>
            <label className="block text-sm font-bold">Descrição<textarea name="description" className="input-field mt-2 min-h-20 resize-y" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold">Ordem<input name="position" type="number" min="1" className="input-field mt-2" defaultValue="1" /></label><label className="block text-sm font-bold">Duração (min)<input name="durationMinutes" type="number" min="0" step="0.1" className="input-field mt-2" defaultValue="0" /></label></div>
            <label className="block text-sm font-bold">Arquivo de vídeo<input name="video" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska" required className="mt-2 block w-full rounded-xl border border-dashed border-[var(--line)] bg-[#f8fbfb] p-3 text-sm" /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input name="isPreview" type="checkbox" /> Aula demonstrativa</label>
          </div>
          {busy === "lesson" ? <div className="mt-5"><div className="flex justify-between text-xs font-bold"><span>Enviando vídeo</span><span>{uploadProgress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e2eaeb]"><div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${uploadProgress}%` }} /></div></div> : null}
          <button disabled={busy !== null || !moduleId} className="btn-primary mt-5 w-full"><Upload size={18} /> {busy === "lesson" ? "Enviando..." : "Enviar aula"}</button>
          <p className="muted mt-3 text-xs leading-5">O envio é retomável. Se a conexão oscilar, o sistema tenta continuar de onde parou.</p>
        </form>
      </section>

      <section>
        <div><p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Conteúdo cadastrado</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Cursos, módulos e aulas</h2></div>
        <div className="mt-5 space-y-5">
          {catalog.length === 0 ? <div className="card p-6 text-sm text-[#647b83]">Nenhum curso cadastrado. Comece pela etapa 1.</div> : catalog.map((course) => (
            <article key={course.id} className="card overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{course.title}</h3><span className={`badge ${course.status === "published" ? "badge-brand" : "bg-[#eef1f2] text-[#667b82]"}`}>{course.status === "published" ? "Publicado" : "Rascunho"}</span></div><p className="muted mt-1 text-sm">{course.modules.length} módulo(s)</p></div></div>
              <div className="divide-y divide-[var(--line)]">{course.modules.length === 0 ? <p className="p-5 text-sm text-[#647b83]">Este curso ainda não possui módulos.</p> : course.modules.map((module) => (
                <div key={module.id} className="p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Módulo {module.position}</p><h4 className="mt-1 font-black">{module.title}</h4></div><span className="muted text-xs font-bold">{module.lessons.length} aula(s)</span></div>
                  <div className="mt-4 space-y-2">{module.lessons.length === 0 ? <p className="rounded-xl bg-[#f7f9f9] p-3 text-sm text-[#647b83]">Nenhuma aula neste módulo.</p> : module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-3"><Video size={18} className="shrink-0 text-[var(--brand-dark)]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{lesson.position}. {lesson.title}</p><p className="muted mt-0.5 text-xs">{Math.round(lesson.durationSeconds / 60)} min {lesson.videoStoragePath ? "• vídeo protegido" : "• sem vídeo"}</p></div><button type="button" onClick={() => deleteLesson(lesson.id, lesson.videoStoragePath)} disabled={busy !== null} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Excluir ${lesson.title}`}><Trash2 size={17} /></button></div>
                  ))}</div>
                </div>
              ))}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
