import Link from "next/link";

export function Logo({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      href="/aluno"
      aria-label="NU.V.E.M Ensino"
      className={`inline-flex items-center gap-3 ${inverse ? "rounded-2xl bg-white px-3 py-2 shadow-sm" : ""}`}
    >
      {/* O arquivo é a marca pública do site institucional da NU.V.E.M. */}
      <img
        src="/logo.png"
        alt="NU.V.E.M Ensino"
        className={compact ? "h-10 w-auto" : "h-14 w-auto"}
      />
    </Link>
  );
}
