import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Status } from "@/lib/types";

interface DailyOperationStatusProps {
  selectedDate: string;
  operation: {
    checks: Array<{ key: string; label: string; done: boolean }>;
    completedCount: number;
    totalCount: number;
    routineDone: boolean;
  };
  summary: {
    coreGoal: string;
    progress: number;
    status: Status;
    completedSummary: string;
    blockedSummary: string;
    evidenceCount: number;
    tomorrowFirstAction: string;
    tomorrowGoalDraft: string;
  };
}

export function DailyOperationStatus({
  selectedDate,
  operation,
  summary,
}: DailyOperationStatusProps) {
  const checklistProgress = Math.round(
    (operation.completedCount / operation.totalCount) * 100,
  );

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">오늘 운영 상태</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedDate} 루틴 체크</p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              operation.routineDone
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {operation.routineDone ? "운영 루틴 완료" : "운영 루틴 진행 중"}
          </span>
        </div>
        <div className="mt-4">
          <ProgressBar value={checklistProgress} />
          <p className="mt-2 text-xs text-slate-500">
            {operation.completedCount}/{operation.totalCount}개 체크 완료
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {operation.checks.map((check) => (
            <div
              key={check.key}
              className={`rounded-md border p-3 text-sm ${
                check.done
                  ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span className="font-medium">{check.done ? "완료" : "대기"}</span>
              <span className="ml-2">{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">하루 요약 카드</h2>
            <p className="mt-1 text-sm text-slate-500">계획, 실행, 회고, 산출물 기준 자동 요약</p>
          </div>
          <StatusBadge status={summary.status} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="오늘 핵심 목표" value={summary.coreGoal} />
          <Info label="최종 진행률" value={`${summary.progress}%`} />
          <Info label="완료한 것 요약" value={summary.completedSummary} />
          <Info label="막힌 점 요약" value={summary.blockedSummary} />
          <Info label="산출물 개수" value={`${summary.evidenceCount}개`} />
          <Info label="내일 첫 행동" value={summary.tomorrowFirstAction} />
          <Info label="내일 목표 초안" value={summary.tomorrowGoalDraft} wide />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-md border border-slate-200 bg-slate-50 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
