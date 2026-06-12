import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AutomationRoadmapItem } from "@/lib/types";

interface AutomationRoadmapProps {
  items: AutomationRoadmapItem[];
}

export function AutomationRoadmap({ items }: AutomationRoadmapProps) {
  return (
    <div className="space-y-4">
      {items
        .slice()
        .sort((a, b) => a.stage - b.stage)
        .map((item) => (
          <article
            id={item.id}
            key={item.id}
            className={`rounded-lg border bg-white p-5 shadow-sm ${
              item.isCurrent ? "border-cyan-300 ring-2 ring-cyan-100" : "border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-950 px-2 py-1 font-mono text-xs text-white">
                    STEP {item.stage}
                  </span>
                  <StatusBadge status={item.status} />
                  {item.isCurrent ? (
                    <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700">
                      현재 단계
                    </span>
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <div className="min-w-56">
                <ProgressBar value={item.progress} />
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ListBlock label="Todo" items={item.todos} />
              <ListBlock label="필요 기술" items={item.requiredSkills} />
              <ListBlock label="차단 조건" items={item.blockers} />
            </div>
          </article>
        ))}
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-800">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
