import Link from "next/link";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/dashboard-utils";
import type { Goal, GoalLevel } from "@/lib/types";

interface GoalTableProps {
  goals: Goal[];
}

const levelLabels: Record<GoalLevel, string> = {
  north_star: "북극성",
  monthly: "월간",
  weekly: "주간",
  daily: "오늘",
};

export function GoalTable({ goals }: GoalTableProps) {
  const sorted = [...goals].sort(
    (a, b) =>
      ["north_star", "monthly", "weekly", "daily"].indexOf(a.level) -
      ["north_star", "monthly", "weekly", "daily"].indexOf(b.level),
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">계층</th>
              <th className="px-4 py-3">목표</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">진행률</th>
              <th className="px-4 py-3">마감일</th>
              <th className="px-4 py-3">관련 Focus</th>
              <th className="px-4 py-3">테이블 후보</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((goal) => (
              <tr id={goal.id} key={goal.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                  {levelLabels[goal.level]}
                </td>
                <td className="min-w-80 px-4 py-4">
                  <div className="font-semibold text-slate-950">{goal.title}</div>
                  <div className="mt-1 leading-5 text-slate-600">{goal.description}</div>
                  {goal.parentGoalId ? (
                    <Link
                      href={`/goals#${goal.parentGoalId}`}
                      className="mt-2 inline-block text-xs font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4"
                    >
                      상위 목표: {goal.parentGoalId}
                    </Link>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={goal.status} />
                </td>
                <td className="min-w-44 px-4 py-4">
                  <ProgressBar value={goal.progress} label="progress" />
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-slate-600">
                  {formatDate(goal.targetDate)}
                </td>
                <td className="px-4 py-4">
                  {goal.relatedDailyFocusId ? (
                    <Link
                      href={`/focus#${goal.relatedDailyFocusId}`}
                      className="font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4"
                    >
                      {goal.relatedDailyFocusId}
                    </Link>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-500">
                  {goal.futureTableName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
