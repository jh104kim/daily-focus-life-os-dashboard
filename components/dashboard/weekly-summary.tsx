import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { DailyFocusPlan, Goal } from "@/lib/types";

interface WeeklySummaryProps {
  range: { start: string; end: string };
  goalCount: number;
  doneCount: number;
  blockedCount: number;
  evidenceCount: number;
  reflectionCount: number;
  averageProgress: number;
  weeklyFocus: DailyFocusPlan[];
  weeklyGoals: Goal[];
}

export function WeeklySummary({
  range,
  goalCount,
  doneCount,
  blockedCount,
  evidenceCount,
  reflectionCount,
  averageProgress,
  weeklyFocus,
  weeklyGoals,
}: WeeklySummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">주간 대시보드</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {range.start} - {range.end}
          </p>
        </div>
        <div className="min-w-56">
          <ProgressBar value={averageProgress} label="주간 평균 진행률" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="주간 목표" value={`${goalCount}개`} />
        <Metric label="완료" value={`${doneCount}개`} />
        <Metric label="Blocked" value={`${blockedCount}개`} />
        <Metric label="Evidence" value={`${evidenceCount}개`} />
        <Metric label="Reflection" value={`${reflectionCount}개`} />
        <Metric label="평균" value={`${averageProgress}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <ListBlock title="이번 주 핵심 Focus" items={weeklyFocus} />
        <ListBlock title="이번 주 목표" items={weeklyGoals} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function ListBlock({
  title,
  items,
}: {
  title: string;
  items: Array<DailyFocusPlan | Goal>;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold text-slate-700">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-md bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="font-mono text-xs text-slate-500">{item.progress}%</span>
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">{item.title}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">이번 주 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
