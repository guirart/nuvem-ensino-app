import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-2xl bg-[var(--brand-pale)] p-4 text-[var(--brand-dark)]">
        <Icon size={28} />
      </div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="muted mt-2 max-w-md text-sm leading-6">{description}</p>
    </div>
  );
}
