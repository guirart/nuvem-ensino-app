export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-semibold">{label}</span>
          <span className="muted font-bold">{normalized}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e2ecee]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),#51a9b7)] transition-all"
          style={{ width: `${normalized}%` }}
          aria-label={`${normalized}% concluído`}
        />
      </div>
    </div>
  );
}
