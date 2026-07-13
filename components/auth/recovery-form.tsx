"use client";

import { useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function RecoveryForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));
    setLoading(true);

    if (configured) {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setMessage("Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.");
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
        Recuperação de acesso
      </p>
      <h1 className="page-title mt-2">Redefina sua senha</h1>
      <p className="muted mt-3 text-sm leading-6">
        Informe o e-mail utilizado na matrícula.
      </p>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-bold">E-mail</span>
        <input name="email" type="email" className="input-field" required />
      </label>

      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}

      <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" size={19} /> : <MailCheck size={19} />}
        {loading ? "Enviando..." : "Enviar instruções"}
      </button>

      <a href="/login" className="btn-ghost mt-3 w-full">Voltar para o login</a>
    </form>
  );
}
