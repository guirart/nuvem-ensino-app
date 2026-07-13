"use client";

import { useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));

    setError("");
    setMessage("");

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    if (!configured) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setMessage("Senha atualizada no modo demonstração.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Senha atualizada. Você já pode acessar sua conta.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
        Nova senha
      </p>
      <h1 className="page-title mt-2">Atualize seu acesso</h1>
      <p className="muted mt-3 text-sm leading-6">
        Escolha uma senha com pelo menos oito caracteres.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Nova senha</span>
          <input name="password" type="password" minLength={8} className="input-field" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Confirmar senha</span>
          <input name="confirmation" type="password" minLength={8} className="input-field" required />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" size={19} /> : <KeyRound size={19} />}
        {loading ? "Atualizando..." : "Salvar nova senha"}
      </button>
      <a href="/login" className="btn-ghost mt-3 w-full">Voltar ao login</a>
    </form>
  );
}
