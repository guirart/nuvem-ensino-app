"use client";

import { useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setMessage("");
    setError("");

    if (!configured) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessage("Cadastro de demonstração concluído. Configure o Supabase para criar contas reais.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: String(form.get("email")),
        password: String(form.get("password")),
        options: {
          data: {
            full_name: String(form.get("name")),
            crm: String(form.get("crm")),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;
      setMessage("Cadastro realizado. Verifique seu e-mail para confirmar o acesso.");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
        Novo cadastro
      </p>
      <h1 className="page-title mt-2">Crie sua conta</h1>
      <p className="muted mt-3 text-sm leading-6">
        O acesso aos cursos depende de uma matrícula ativa vinculada ao seu e-mail.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Nome completo</span>
          <input name="name" className="input-field" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">E-mail</span>
          <input name="email" type="email" className="input-field" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">CRM ou registro profissional</span>
          <input name="crm" className="input-field" placeholder="Ex.: CRM-MG 12345" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Senha</span>
          <input name="password" type="password" minLength={8} className="input-field" required />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" size={19} /> : <UserPlus size={19} />}
        {loading ? "Criando..." : "Criar conta"}
      </button>

      <p className="muted mt-6 text-center text-sm">
        Já possui uma conta?{" "}
        <a href="/login" className="font-extrabold text-[var(--brand-dark)] hover:underline">
          Entrar
        </a>
      </p>
    </form>
  );
}
