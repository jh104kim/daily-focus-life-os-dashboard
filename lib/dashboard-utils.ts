import { goals } from "./mock-data";
import type {
  AiApplication,
  BaseEntity,
  DailyFocusPlan,
  EvidenceLog,
  Goal,
  LearningModule,
  Reflection,
  Status,
} from "./types";

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

export function getDateKey(date: Date | string): string {
  const target = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
}

export function getMonthKey(date: Date | string): string {
  return getDateKey(date).slice(0, 7);
}

export function getWeekKey(date: Date | string): string {
  const key = getDateKey(date);
  const target = new Date(`${key}T00:00:00`);
  const day = target.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(target);
  monday.setDate(target.getDate() + mondayOffset);
  return getDateKey(monday);
}

export function getWeekRange(date: Date | string): { start: string; end: string } {
  const start = getWeekKey(date);
  const endDate = new Date(`${start}T00:00:00`);
  endDate.setDate(endDate.getDate() + 6);
  return { start, end: getDateKey(endDate) };
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const key = getDateKey(date);
  return key >= start && key <= end;
}

export function isSameMonth(date: string, monthKey: string): boolean {
  return getMonthKey(date) === monthKey;
}

export function calculateAverageProgress<T extends Pick<BaseEntity, "progress">>(
  items: T[],
): number {
  return calcOverallProgress(items);
}

export function countByStatus<T extends Pick<BaseEntity, "status">>(
  items: T[],
): Record<Status, number> {
  return items.reduce<Record<Status, number>>(
    (counts, item) => ({
      ...counts,
      [item.status]: counts[item.status] + 1,
    }),
    { planned: 0, in_progress: 0, done: 0, blocked: 0 },
  );
}

export function getDailyFocusByDate(
  date: string,
  dailyFocusPlans: DailyFocusPlan[],
): DailyFocusPlan | undefined {
  const key = getDateKey(date);
  return dailyFocusPlans.find(
    (plan) => getDateKey(plan.selectedDate ?? plan.targetDate) === key,
  );
}

export function getReflectionByDate(
  date: string,
  reflections: Reflection[],
): Reflection | undefined {
  const key = getDateKey(date);
  return reflections.find(
    (reflection) => getDateKey(reflection.reflectionDate ?? reflection.targetDate) === key,
  );
}

export function getEvidenceLogsByDate(
  date: string,
  evidenceLogs: EvidenceLog[],
): EvidenceLog[] {
  const key = getDateKey(date);
  return evidenceLogs.filter(
    (evidence) => getDateKey(evidence.evidenceDate ?? evidence.targetDate) === key,
  );
}

export function getDailyOperationStatus(
  date: string,
  data: {
    dailyFocusPlans: DailyFocusPlan[];
    reflections: Reflection[];
    evidenceLogs: EvidenceLog[];
  },
) {
  const focus = getDailyFocusByDate(date, data.dailyFocusPlans);
  const reflection = getReflectionByDate(date, data.reflections);
  const evidence = getEvidenceLogsByDate(date, data.evidenceLogs);
  const checks = [
    { key: "import", label: "오늘 계획 Import 완료", done: Boolean(focus) },
    {
      key: "progress",
      label: "Daily Focus 진행률 업데이트",
      done: Boolean(focus && focus.progress > 0),
    },
    {
      key: "firstAction",
      label: "첫 행동 완료",
      done: Boolean(focus?.firstActionDone),
    },
    {
      key: "completion",
      label: "완료 기준 체크",
      done: Boolean(focus?.completionChecked),
    },
    { key: "reflection", label: "Reflection 작성", done: Boolean(reflection) },
    { key: "evidence", label: "Evidence Log 1개 이상 작성", done: evidence.length > 0 },
    {
      key: "nextAction",
      label: "nextAction 입력",
      done: Boolean(focus?.nextAction?.trim()),
    },
  ];

  return {
    checks,
    completedCount: checks.filter((check) => check.done).length,
    totalCount: checks.length,
    routineDone: Boolean(focus && focus.progress > 0 && reflection && evidence.length > 0),
  };
}

export function getDailySummary(
  date: string,
  data: {
    dailyFocusPlans: DailyFocusPlan[];
    reflections: Reflection[];
    evidenceLogs: EvidenceLog[];
  },
) {
  const focus = getDailyFocusByDate(date, data.dailyFocusPlans);
  const reflection = getReflectionByDate(date, data.reflections);
  const evidence = getEvidenceLogsByDate(date, data.evidenceLogs);

  return {
    coreGoal: focus?.title ?? "등록된 Daily Focus가 없습니다.",
    progress: focus?.progress ?? 0,
    status: focus?.status ?? "planned",
    completedSummary: reflection?.completed.filter(Boolean).join(" / ") || "-",
    blockedSummary:
      focus?.blockedReason ||
      reflection?.misses.filter(Boolean).join(" / ") ||
      "-",
    evidenceCount: evidence.length,
    tomorrowFirstAction: reflection?.tomorrowFirstAction || focus?.nextAction || "-",
    tomorrowGoalDraft: reflection?.tomorrowGoalDraft || "-",
  };
}

export function getWeeklySummary(
  date: string,
  data: {
    dailyFocusPlans: DailyFocusPlan[];
    goals: Goal[];
    evidenceLogs: EvidenceLog[];
    reflections: Reflection[];
  },
) {
  const { start, end } = getWeekRange(date);
  const weeklyFocus = data.dailyFocusPlans.filter((item) =>
    isDateInRange(item.selectedDate ?? item.targetDate, start, end),
  );
  const weeklyGoals = data.goals.filter((item) =>
    isDateInRange(item.targetDate, start, end),
  );
  const weeklyEvidence = data.evidenceLogs.filter((item) =>
    isDateInRange(item.evidenceDate ?? item.targetDate, start, end),
  );
  const weeklyReflections = data.reflections.filter((item) =>
    isDateInRange(item.reflectionDate ?? item.targetDate, start, end),
  );
  const combined = [...weeklyFocus, ...weeklyGoals];

  return {
    start,
    end,
    weeklyFocus,
    weeklyGoals,
    weeklyEvidence,
    weeklyReflections,
    goalCount: weeklyGoals.length + weeklyFocus.length,
    doneCount: combined.filter((item) => item.status === "done").length,
    blockedCount: combined.filter((item) => item.status === "blocked").length,
    averageProgress: calculateAverageProgress(combined),
  };
}

export function getMonthlySummary(
  date: string,
  data: {
    dailyFocusPlans: DailyFocusPlan[];
    goals: Goal[];
    aiApplications: AiApplication[];
    learningModules: LearningModule[];
    evidenceLogs: EvidenceLog[];
    reflections: Reflection[];
  },
) {
  const monthKey = getMonthKey(date);
  const monthlyGoals = data.goals.filter((item) => isSameMonth(item.targetDate, monthKey));
  const monthlyFocus = data.dailyFocusPlans.filter((item) =>
    isSameMonth(item.selectedDate ?? item.targetDate, monthKey),
  );
  const monthlyEvidence = data.evidenceLogs.filter((item) =>
    isSameMonth(item.evidenceDate ?? item.targetDate, monthKey),
  );
  const monthlyReflections = data.reflections.filter((item) =>
    isSameMonth(item.reflectionDate ?? item.targetDate, monthKey),
  );
  const monthlyAi = data.aiApplications.filter((item) =>
    isSameMonth(item.targetDate, monthKey),
  );
  const activeLearning = data.learningModules.filter(
    (item) => item.focusToday || isSameMonth(item.targetDate, monthKey),
  );
  const combined = [...monthlyGoals, ...monthlyFocus];

  return {
    monthKey,
    monthlyGoals,
    monthlyFocus,
    monthlyEvidence,
    monthlyReflections,
    monthlyAi,
    activeLearning,
    goalCount: monthlyGoals.length + monthlyFocus.length,
    doneCount: combined.filter((item) => item.status === "done").length,
    blockedCount: combined.filter((item) => item.status === "blocked").length,
    averageProgress: calculateAverageProgress(combined),
  };
}
