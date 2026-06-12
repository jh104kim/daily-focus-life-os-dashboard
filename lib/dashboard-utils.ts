import { goals } from "./mock-data";
import type { BaseEntity, Goal, Status } from "./types";

export function getStatusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    planned: "예정",
    in_progress: "진행 중",
    done: "완료",
    blocked: "차단",
  };

  return labels[status];
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    planned: "border-slate-200 bg-slate-100 text-slate-700",
    in_progress: "border-cyan-200 bg-cyan-50 text-cyan-700",
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blocked: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return colors[status];
}

export function calcOverallProgress<T extends Pick<BaseEntity, "progress">>(
  items: T[],
): number {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + item.progress, 0);
  return Math.round(total / items.length);
}

export function filterByStatus<T extends Pick<BaseEntity, "status">>(
  items: T[],
  status: Status,
): T[] {
  return items.filter((item) => item.status === status);
}

export function groupByCategory<T extends Pick<BaseEntity, "category">>(
  items: T[],
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item];
    return groups;
  }, {});
}

export function getRelatedGoal(goalId?: string): Goal | undefined {
  if (!goalId) {
    return undefined;
  }

  return goals.find((goal) => goal.id === goalId);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function sortByUpdatedAt<T extends Pick<BaseEntity, "updatedAt">>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
