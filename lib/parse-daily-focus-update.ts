import { getMonthKey, getWeekKey } from "./dashboard-utils";
import type { AutomationBlock, AutomationImportPreview, DailyFocusPlan } from "./types";

export function parseDailyFocusUpdate(
  block: AutomationBlock,
  context: { dailyFocusPlans?: DailyFocusPlan[] },
): AutomationImportPreview {
  const existing = findDailyFocus(context.dailyFocusPlans, block.targetDate);
  const progress = extractNumber(block.rawText, ["progress", "진행률", "진행률 업데이트"]);
  const status = extractValue(block.rawText, ["status", "상태"]);
  const nextAction = extractValue(block.rawText, ["nextAction", "다음 행동"]);
  const blockedReason = extractValue(block.rawText, ["blockedReason", "막힌 점"]);
  const reviewNotes = extractValue(block.rawText, ["reviewNotes", "검토 메모"]);
  const actualOutput = extractValue(block.rawText, ["actualOutput", "실제 산출물"]);

  const dailyFocusPlan: DailyFocusPlan = {
    ...(existing ?? createFallbackFocus(block)),
    progress: progress ?? existing?.progress ?? 0,
    status: normalizeStatus(status) ?? existing?.status ?? "in_progress",
    nextAction: nextAction || existing?.nextAction || "",
    blockedReason: blockedReason || existing?.blockedReason || "",
    reviewNotes: reviewNotes || existing?.reviewNotes || "",
    actualOutput: actualOutput || existing?.actualOutput || "",
    firstActionDone:
      parseBoolean(block.rawText, ["firstActionDone", "첫 행동 완료"]) ??
      existing?.firstActionDone ??
      false,
    completionChecked:
      parseBoolean(block.rawText, ["completionChecked", "완료 기준 체크"]) ??
      existing?.completionChecked ??
      false,
    selectedDate: existing?.selectedDate ?? block.targetDate,
    weekKey: existing?.weekKey ?? getWeekKey(block.targetDate),
    monthKey: existing?.monthKey ?? getMonthKey(block.targetDate),
    updatedAt: new Date().toISOString(),
  };

  return {
    automationType: "daily_focus_update",
    targetDate: block.targetDate,
    sourceTitle: block.sourceTitle,
    targetFiles: ["data/daily-focus-plans.json"],
    dailyFocusPlan,
    evidenceLogs: [],
    missingFields: existing ? [] : ["기존 Daily Focus"],
    autoFilledFields: existing ? [] : ["fallback Daily Focus"],
    warnings: existing ? [] : ["해당 날짜 Daily Focus가 없어 최소 항목을 생성합니다."],
    overwrite: { dailyFocusPlan: Boolean(existing) },
  };
}

function findDailyFocus(items: DailyFocusPlan[] | undefined, date: string) {
  return items?.find((item) => item.selectedDate === date || item.targetDate === date);
}

function createFallbackFocus(block: AutomationBlock): DailyFocusPlan {
  return {
    id: `focus-update-${block.targetDate}`,
    title: `Daily Focus Update - ${block.targetDate}`,
    description: "Bulk Import에서 생성된 Daily Focus Update",
    status: "in_progress",
    progress: 0,
    category: "Daily Focus Update",
    targetDate: block.targetDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dataSource: "chatgpt_automation",
    futureTableName: "daily_focus_plans",
    automationReady: true,
    subGoals: ["업데이트 항목 확인", "다음 행동 정리"],
    firstAction: "Daily Focus Update 내용을 확인한다.",
    completionCriteria: "진행률과 다음 행동이 업데이트됨",
    expectedOutput: "Daily Focus 업데이트 로그",
    mustNotMiss: "업데이트 누락 방지",
    selectedDate: block.targetDate,
    weekKey: getWeekKey(block.targetDate),
    monthKey: getMonthKey(block.targetDate),
  };
}

function extractValue(text: string, labels: string[]): string {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/^[-*]\s*/, "").trim();
    const label = labels.find((item) =>
      trimmed.toLowerCase().startsWith(item.toLowerCase()),
    );
    if (label) {
      return trimmed
        .replace(new RegExp(`^${escapeRegExp(label)}\\s*[:：-]?\\s*`, "i"), "")
        .trim();
    }
  }
  return "";
}

function extractNumber(text: string, labels: string[]): number | undefined {
  const value = extractValue(text, labels);
  const matched = value.match(/\d+/)?.[0];
  return matched ? Math.max(0, Math.min(100, Number(matched))) : undefined;
}

function parseBoolean(text: string, labels: string[]): boolean | undefined {
  const value = extractValue(text, labels).toLowerCase();
  if (!value) {
    return undefined;
  }
  if (/(true|yes|완료|checked|done)/.test(value)) {
    return true;
  }
  if (/(false|no|미완료|unchecked)/.test(value)) {
    return false;
  }
  return undefined;
}

function normalizeStatus(value: string) {
  if (["planned", "in_progress", "done", "blocked"].includes(value)) {
    return value as DailyFocusPlan["status"];
  }
  if (/완료/.test(value)) {
    return "done";
  }
  if (/막힘|차단|blocked/.test(value)) {
    return "blocked";
  }
  if (/진행/.test(value)) {
    return "in_progress";
  }
  return undefined;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
