interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "cyan" | "emerald" | "amber" | "rose";
}

const toneStyles = {
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
};

export function KpiCard({ label, value, detail, tone = "cyan" }: KpiCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${toneStyles[tone]}`}
      >
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
    </section>
  );
}
