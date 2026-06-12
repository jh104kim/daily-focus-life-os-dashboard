import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RelatedLink } from "@/components/dashboard/related-link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { LearningModule } from "@/lib/types";

interface LearningModuleCardProps {
  module: LearningModule;
}

export function LearningModuleCard({ module }: LearningModuleCardProps) {
  return (
    <article id={module.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={module.status} />
        {module.focusToday ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            오늘 집중
          </span>
        ) : null}
      </div>
      <h2 className="text-base font-semibold text-slate-950">{module.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
      <div className="mt-4 grid gap-3">
        <LevelDots label="현재 수준" value={module.currentLevel} />
        <LevelDots label="목표 수준" value={module.targetLevel} />
        <ProgressBar value={module.progress} />
      </div>
      <div className="mt-4 text-sm text-slate-600">
        {module.relatedGoalId ? (
          <span>
            관련 목표:{" "}
            <RelatedLink href={`/goals#${module.relatedGoalId}`} label={module.relatedGoalId} />
          </span>
        ) : (
          <span className="text-slate-400">관련 목표 미지정</span>
        )}
      </div>
    </article>
  );
}

function LevelDots({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`h-2.5 w-2.5 rounded-full ${
              dot <= value ? "bg-cyan-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
