interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{label ?? "진행률"}</span>
        <span className="font-mono text-slate-700">{safeValue}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-cyan-600"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
