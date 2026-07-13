import type { Metadata } from "next";
import { Save, ShieldCheck, Smartphone } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Conta</p>
      <h1 className="page-title mt-2">Meu perfil</h1>
      <p className="muted mt-3">Mantenha seus dados profissionais atualizados.</p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
        <form className="card p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold">Nome completo</span><input className="input-field" defaultValue={user?.name} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">E-mail</span><input className="input-field" defaultValue={user?.email} disabled /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">CRM/registro profissional</span><input className="input-field" defaultValue={user?.crm} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">Telefone</span><input className="input-field" placeholder="(31) 99999-9999" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">Especialidade</span><input className="input-field" placeholder="Gastroenterologia" /></label>
          </div>
          <button type="button" className="btn-primary mt-6"><Save size={18} /> Salvar alterações</button>
        </form>

        <aside className="space-y-4">
          <div className="card p-5"><ShieldCheck className="text-[var(--brand-dark)]" /><h2 className="mt-4 font-black">Segurança</h2><p className="muted mt-2 text-sm leading-6">Troque sua senha e revise os acessos vinculados à conta.</p><button className="btn-secondary mt-4 w-full">Alterar senha</button></div>
          <div className="card p-5"><Smartphone className="text-[var(--brand-dark)]" /><h2 className="mt-4 font-black">Instalar aplicativo</h2><p className="muted mt-2 text-sm leading-6">No navegador do celular, use “Adicionar à Tela de Início”.</p></div>
        </aside>
      </div>
    </div>
  );
}
