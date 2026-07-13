import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  Home,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const nav = [
  { href: "/aluno", label: "Início", icon: Home },
  { href: "/aluno/cursos", label: "Cursos", icon: BookOpen },
  { href: "/aluno/certificados", label: "Certificados", icon: Award },
  { href: "/aluno/perfil", label: "Perfil", icon: UserRound },
];

export function StudentShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-white lg:flex lg:min-h-dvh lg:flex-col lg:p-5">
        <Logo compact />
        <nav className="mt-9 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#536b73] transition hover:bg-[var(--brand-pale)] hover:text-[var(--brand-dark)]"
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        {user.role === "admin" ? (
          <div className="mt-6 border-t border-[var(--line)] pt-5">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl bg-[var(--ink)] px-3 py-3 text-sm font-bold text-white"
            >
              <ShieldCheck size={20} />
              Painel administrativo
            </Link>
          </div>
        ) : null}

        <div className="mt-auto rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="truncate text-sm font-extrabold">{user.name}</p>
          <p className="muted mt-1 truncate text-xs">{user.email}</p>
          <a href="/login" className="mt-4 flex items-center gap-2 text-xs font-extrabold text-[var(--brand-dark)]">
            <LogOut size={16} /> Sair
          </a>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
          <div className="container-app flex h-16 items-center justify-between gap-4">
            <div className="lg:hidden"><Logo compact /></div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-sm font-extrabold">Olá, {user.name.split(" ")[0]}</p>
              <p className="muted text-xs">Continue sua formação</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white" aria-label="Notificações">
                <Bell size={19} />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white lg:hidden" aria-label="Menu">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="safe-bottom container-app py-6 sm:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/96 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(23,49,59,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.67rem] font-extrabold text-[#60777e]">
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
