"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, GraduationCap, LayoutDashboard, LogOut, UsersRound, Video } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const adminNav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/conteudo", label: "Aulas", icon: Video },
  { href: "/admin/alunos", label: "Alunos", icon: UsersRound },
  { href: "/admin/matriculas", label: "Matrículas", icon: GraduationCap },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#eef3f4] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-dvh flex-col bg-[var(--ink)] p-5 text-white lg:flex">
        <Logo compact inverse />
        <p className="mt-8 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Administração</p>
        <nav className="mt-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-white text-[var(--ink)]" : "text-white/72 hover:bg-white/8 hover:text-white"}`}><Icon size={20} />{label}</Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <Link href="/aluno" className="flex items-center gap-2 rounded-xl border border-white/12 px-3 py-3 text-sm font-bold text-white/72 hover:bg-white/8"><ArrowLeft size={18} /> Voltar à área do aluno</Link>
          <Link href="/auth/signout" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-white/60 hover:bg-white/8 hover:text-white"><LogOut size={18} /> Sair</Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur-xl">
          <div className="container-app flex h-16 items-center justify-between"><div className="lg:hidden"><Logo compact /></div><p className="hidden font-black lg:block">Painel administrativo</p><div className="flex items-center gap-4"><Link href="/aluno" className="text-sm font-extrabold text-[var(--brand-dark)]">Área do aluno</Link><Link href="/auth/signout" className="hidden text-sm font-bold text-[#647b83] sm:inline">Sair</Link></div></div>
          <nav className="container-app flex gap-1 overflow-x-auto pb-3 lg:hidden">
            {adminNav.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return <Link key={href} href={href} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold ${active ? "border-[var(--brand)] bg-[var(--brand-pale)] text-[var(--brand-dark)]" : "border-[var(--line)] bg-white text-[#536b73]"}`}><Icon size={16} />{label}</Link>;
            })}
          </nav>
        </header>
        <main className="container-app py-7">{children}</main>
      </div>
    </div>
  );
}
