import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, LayoutDashboard, UsersRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const adminNav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/alunos", label: "Alunos", icon: UsersRound },
  { href: "/admin/matriculas", label: "Matrículas", icon: GraduationCap },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#eef3f4] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-dvh flex-col bg-[var(--ink)] p-5 text-white lg:flex">
        <Logo compact inverse />
        <p className="mt-8 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Administração</p>
        <nav className="mt-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/72 hover:bg-white/8 hover:text-white"><Icon size={20} />{label}</Link>
          ))}
        </nav>
        <Link href="/aluno" className="mt-auto flex items-center gap-2 rounded-xl border border-white/12 px-3 py-3 text-sm font-bold text-white/72"><ArrowLeft size={18} /> Voltar à área do aluno</Link>
      </aside>
      <div>
        <header className="border-b border-[var(--line)] bg-white"><div className="container-app flex h-16 items-center justify-between"><div className="lg:hidden"><Logo compact /></div><p className="hidden font-black lg:block">Painel administrativo</p><Link href="/aluno" className="text-sm font-extrabold text-[var(--brand-dark)]">Área do aluno</Link></div></header>
        <main className="container-app py-7">{children}</main>
      </div>
    </div>
  );
}
