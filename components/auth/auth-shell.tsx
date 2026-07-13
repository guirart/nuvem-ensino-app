import { ShieldCheck, Smartphone, Stethoscope } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden min-h-dvh flex-col justify-between overflow-hidden bg-[var(--ink)] p-10 text-white lg:flex">
        <Logo inverse />
        <div className="max-w-xl">
          <span className="badge border border-white/15 bg-white/10 text-white">
            Formação médica no celular
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[1.03] tracking-[-0.045em]">
            Sua formação clínica, organizada e sempre acessível.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/72">
            Acesse aulas, materiais, encontros e certificados da NU.V.E.M em uma experiência pensada para a rotina médica.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              [Smartphone, "Experiência mobile"],
              [ShieldCheck, "Acesso protegido"],
              [Stethoscope, "Conteúdo especializado"],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof Smartphone;
              return (
                <div key={text as string} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ItemIcon size={22} />
                  <p className="mt-3 text-sm font-bold">{text as string}</p>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-white/48">© 2026 NU.V.E.M Ensino · Belo Horizonte, MG</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
