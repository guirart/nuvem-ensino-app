"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("medico@nuvemensino.com.br");
  const [password, setPassword] = useState("demonstracao");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!configured) {
      await new Promise((resolve) => setTimeout(resolve, 550));
      router.push("/aluno");
      router.refresh();
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push("/aluno");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Não foi possível entrar.");
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!configured) {
      router.push("/aluno");
      return;
    }

    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
          Área do aluno
        </p>
        <h1 className="page-title mt-2">Acesse suas aulas</h1>
        <p className="muted mt-3 text-sm leading-6">
          Entre com o mesmo e-mail utilizado na matrícula.
        </p>
      </div>

      {!configured ? (
        <div className="mt-5 rounded-xl border border-[#cfe4e7] bg-[#edf7f8] p-3 text-sm leading-5 text-[#315e68]">
          Modo demonstração ativo. Os dados abaixo já estão preenchidos.
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">E-mail</span>
          <input
            className="input-field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">Senha</span>
          <span className="relative block">
            <input
              className="input-field pr-12"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#70858c]"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </span>
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <a href="/recuperar-senha" className="text-sm font-bold text-[var(--brand-dark)] hover:underline">
          Esqueci minha senha
        </a>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" size={19} /> : <LogIn size={19} />}
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#8aa0a6]">
        <span className="h-px flex-1 bg-[var(--line)]" /> ou <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <button type="button" onClick={signInWithGoogle} className="btn-secondary w-full">
        <span className="grid h-5 w-5 place-items-center rounded-full border text-xs font-black">G</span>
        Continuar com Google
      </button>

      <p className="muted mt-6 text-center text-sm">
        Ainda não tem acesso?{" "}
        <a href="/cadastro" className="font-extrabold text-[var(--brand-dark)] hover:underline">
          Criar cadastro
        </a>
      </p>
    </form>
  );
}
