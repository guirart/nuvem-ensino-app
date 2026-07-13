"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Award, Bell, BookOpen, Home, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const nav = [
  { href: "/aluno", label: "Início", icon: Home },
  { href: "/aluno/cursos", label: "Cursos", icon: BookOpen },
  { href: "/aluno/certificados", label: "Certificados", icon: Award },
  { href: "/aluno/perfil", label: "Perfil", icon: UserRound },
];

function active(pathname: string, href: string) {
  return href === "/aluno" ? pathname === href : pathname.startsWith(href);
}

export function StudentShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-white lg:flex lg:min-h-dvh lg:flex-col lg:p-5">
        <Logo compact />
        <nav className="mt-9 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active(pathname, href) ? "bg-[var(--brand-pale)] text-[var(--brand-dark)]" : "text-[#536b73] hover:bg-[var(--brand-pale)] hover:text-[var(--brand-dark)]"}`}><Icon size={20} />{label}</Link>)}
        </nav>
        {user.role === "admin" ? <div className="mt-6 border-t border-[var(--line)] pt-5"><Link href="/admin" className="flex items-center gap-3 rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-bold text-white"><ShieldCheck size={20} />Painel administrativo</Link></div> : null}
        <div className="mt-auto rounded-2xl bg-[var(--surface-soft)] p-4"><p className="truncate text-sm font-extrabold">{user.name}</p><p className="muted mt-1 truncate text-xs">{user.email}</p><Link href="/auth/signout" className="mt-4 flex items-center gap-2 text-xs font-extrabold text-[var(--brand-dark)]"><LogOut size={16} /> Sair</Link></div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
          <div className="container-app relative flex h-16 items-center justify-between gap-4">
            <div className="lg:hidden"><Logo compact /></div>
            <div className="hidden min-w-0 lg:block"><p className="text-sm font-extrabold">Olá, {user.name.split(" ")[0]}</p><p className="muted text-xs">Continue sua formação</p></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setNotificationsOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white" aria-label="Notificações"><Bell size={19} /></button>
              <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white lg:hidden" aria-label="Menu"><Menu size={20} /></button>
            </div>
            {notificationsOpen ? <div className="card absolute right-0 top-14 z-50 w-[min(340px,calc(100vw-2rem))] p-4"><div className="flex items-center justify-between"><h2 className="font-black">Notificações</h2><button onClick={() => setNotificationsOpen(false)} aria-label="Fechar"><X size={18} /></button></div><p className="muted mt-4 text-sm">Nenhuma notificação nova.</p></div> : null}
          </div>
        </header>
        <main className="safe-bottom container-app py-6 sm:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/96 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(23,49,59,0.08)] backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-4">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.67rem] font-extrabold ${active(pathname, href) ? "text-[var(--brand-dark)]" : "text-[#60777e]"}`}><Icon size={20} />{label}</Link>)}</div></nav>

      {menuOpen ? <div className="fixed inset-0 z-50 bg-[#10252d]/60 backdrop-blur-sm lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}><aside className="ml-auto flex h-full w-[min(330px,88vw)] flex-col bg-white p-5"><div className="flex items-center justify-between"><Logo compact /><button onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)]"><X size={20} /></button></div><nav className="mt-8 space-y-2">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active(pathname, href) ? "bg-[var(--brand-pale)] text-[var(--brand-dark)]" : "text-[#536b73]"}`}><Icon size={20} />{label}</Link>)}{user.role === "admin" ? <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-bold text-white"><ShieldCheck size={20} />Painel administrativo</Link> : null}</nav><Link href="/auth/signout" className="mt-auto flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-3 text-sm font-bold"><LogOut size={18} /> Sair</Link></aside></div> : null}
    </div>
  );
}
