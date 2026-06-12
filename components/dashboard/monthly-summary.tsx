import { ProgressBar } from "@/components/dashboard/progress-bar";
import type {
  AiApplication,
  DailyFocusPlan,
  EvidenceLog,
  Goal,
  LearningModule,
  Reflection,
} from "@/lib/types";

interface MonthlySummaryProps {
  monthKey: string;
  goalCount: number;
  doneCount: number;
  blockedCount: number;
  averageProgress: number;
  monthlyGoals: Goal[];
  monthlyFocus: DailyFocusPlan[];
  monthlyEvidence: EvidenceLog[];
  monthlyReflections: Reflection[];
  monthlyAi: AiApplication[];
  activeLearning: LearningModule[];
}

export function MonthlySummary({
  monthKey,
  goalCount,
  doneCount,
  blockedCount,
  averageProgress,
  monthlyGoals,
  monthlyFocus,
  monthlyEvidence,
  monthlyReflections,
  monthlyAi,
  activeLearning,
}: MonthlySummaryProps) {
  const topGoals = [...monthlyGoals, ...monthlyFocus]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">월간 요약</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{monthKey}</p>
        </div>
        <div className="min-w-56">
          <ProgressBar value={averageProgress} label="월간 평균 진행률" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="월간 목표" value={`${goalCount}개`} />
        <Metric label="완료 목표" value={`${doneCount}개`} />
        <Metric label="산출물 로그" value={`${monthlyEvidence.length}개`} />
        <Metric label="회고 일수" value={`${monthlyReflections.length}일`} />
        <Metric label="Blocked" value={`${blockedCount}회`} />
        <Metric label="AI/AX" value={`${monthlyAi.length}개`} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">월간 주요 목표 Top 3</div>
          <div className="mt-3 space-y-2">
            {topGoals.map((item) => (
              <div key={item.id} className="rounded-md bg-white p-3">
                <div className="text-sm font-medium text-slate-900">{item.title}</div>
                <ProgressBar value={item.progress} label="progress" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">자동화/학습 진행 요약</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeLearning.slice(0, 6).map((module) => (
              <span
                key={module.id}
                className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700"
              >
                {module.title} {module.progress}%
              </span>
            ))}
          </div>
        </div>
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
