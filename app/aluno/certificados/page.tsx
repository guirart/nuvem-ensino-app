import type { Metadata } from "next";
import { Award, Download, Lock } from "lucide-react";
import { certificates } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Certificados" };

export default function CertificatesPage() {
  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--brand-dark)]">Documentos</p>
      <h1 className="page-title mt-2">Certificados</h1>
      <p className="muted mt-3">Seus certificados são liberados após o cumprimento dos critérios do curso.</p>

      <div className="mt-7 grid gap-4">
        {certificates.map((certificate) => (
          <article key={certificate.id} className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${certificate.status === "available" ? "bg-[#f6edd8] text-[#80611e]" : "bg-[#edf1f2] text-[#788b91]"}`}>
              {certificate.status === "available" ? <Award size={28} /> : <Lock size={24} />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-black">{certificate.courseTitle}</h2>
              <p className="muted mt-1 text-sm">{certificate.workload} · {certificate.issuedAt}</p>
            </div>
            <button className={certificate.status === "available" ? "btn-primary" : "btn-secondary"} disabled={certificate.status !== "available"}>
              <Download size={18} /> {certificate.status === "available" ? "Baixar certificado" : "Pendente"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
