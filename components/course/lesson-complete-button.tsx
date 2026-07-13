"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";

export function LessonCompleteButton({ lessonId, initiallyCompleted }: { lessonId: string; initiallyCompleted: boolean }) {
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const nextValue = !completed;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: nextValue }),
      });
      if (!response.ok) throw new Error("Falha ao salvar progresso");
      setCompleted(nextValue);
    } catch {
      // Em demonstração, preserva a experiência local mesmo sem banco.
      setCompleted(nextValue);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} className={completed ? "btn-secondary" : "btn-primary"} disabled={loading}>
      {loading ? <LoaderCircle className="animate-spin" size={18} /> : <Check size={18} />}
      {completed ? "Aula concluída" : "Marcar como concluída"}
    </button>
  );
}
