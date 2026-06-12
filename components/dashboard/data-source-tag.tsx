import type { DataSource } from "@/lib/types";

interface DataSourceTagProps {
  source: DataSource;
}

const sourceLabels: Record<DataSource, string> = {
  mock: "mock",
  future_supabase: "future_supabase",
  future_obsidian: "future_obsidian",
  future_json: "future_json",
};

const sourceStyles: Record<DataSource, string> = {
  mock: "border-slate-200 bg-white text-slate-700",
  future_supabase: "border-emerald-200 bg-emerald-50 text-emerald-700",
  future_obsidian: "border-violet-200 bg-violet-50 text-violet-700",
  future_json: "border-amber-200 bg-amber-50 text-amber-700",
};

export function DataSourceTag({ source }: DataSourceTagProps) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 font-mono text-[11px] ${sourceStyles[source]}`}
    >
      {sourceLabels[source]}
    </span>
  );
}
