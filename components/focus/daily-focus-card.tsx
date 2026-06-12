import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RelatedLink } from "@/components/dashboard/related-link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataSourceTag } from "@/components/dashboard/data-source-tag";
import { getRelatedGoal } from "@/lib/dashboard-utils";
import { learningModules } from "@/lib/mock-data";
import type { DailyFocusPlan } from "@/lib/types";

interface DailyFocusCardProps {
  plan: DailyFocusPlan;
}

export function DailyFocusCard({ plan }: DailyFocusCardProps) {
  const goal = getRelatedGoal(plan.relatedGoalId);
  const learningModule = learningModules.find((item) => item.id === plan.relatedModuleId);

  return (
    <article id={plan.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={plan.status} />
            <DataSourceTag source={plan.dataSource} />
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
              {plan.futureTableName}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-950">{plan.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{plan.description}</p>
        </div>
        <div className="min-w-52">
          <ProgressBar value={plan.progress} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoBlock label="서브 목표 1" value={plan.subGoals[0]} />
        <InfoBlock label="서브 목표 2" value={plan.subGoals[1]} />
        <InfoBlock label="오늘 가장 먼저 할 일" value={plan.firstAction} />
        <InfoBlock label="완료 기준" value={plan.completionCriteria} />
        <InfoBlock label="예상 산출물" value={plan.expectedOutput} />
        <InfoBlock label="놓치면 안 되는 것" value={plan.mustNotMiss} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
        {goal ? (
          <span>
            관련 목표: <RelatedLink href={`/goals#${goal.id}`} label={goal.title} />
          </span>
        ) : null}
        {learningModule ? (
          <span>
            관련 학습:{" "}
            <RelatedLink href={`/learning#${learningModule.id}`} label={learningModule.title} />
          </span>
        ) : null}
      </div>
    </article>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
}
