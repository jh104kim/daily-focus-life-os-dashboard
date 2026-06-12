import type { DataSource } from "@/lib/types";
import { DataSourceTag } from "./data-source-tag";

interface SectionHeaderProps {
  title: string;
  description?: string;
  dataSource?: DataSource;
  futureTableName?: string;
}

export function SectionHeader({
  title,
  description,
  dataSource = "mock",
  futureTableName,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceTag source={dataSource} />
        {futureTableName ? (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
            next: {futureTableName}
          </span>
        ) : null}
      </div>
    </div>
  );
}
