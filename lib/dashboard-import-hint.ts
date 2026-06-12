import type { AutomationType } from "./types";

const knownAutomationTypes: AutomationType[] = [
  "oflow_morning_brief",
  "ai_education_focus",
  "evening_reflection",
  "daily_focus_ab_test",
  "ai_framework_check",
  "reminder_task",
  "daily_focus_update",
  "daily_operation_log",
  "unknown",
];

const allowedJsonFiles = new Set([
  "daily-focus-plans.json",
  "goals.json",
  "learning-modules.json",
  "ai-applications.json",
  "reflections.json",
  "evidence-logs.json",
  "brief-logs.json",
  "ab-test-logs.json",
  "ai-framework-checks.json",
  "reminder-tasks.json",
  "automation-import-logs.json",
]);

export interface DashboardImportHint {
  automationType?: AutomationType;
  targetDate?: string;
  primaryJson?: string;
  relatedJson: string[];
}

export function parseDashboardImportHint(text: string): DashboardImportHint {
  const block =
    text.match(/\[Dashboard Import Hint\]([\s\S]*?)(?=\n#|\n\[Dashboard Import Hint\]|$)/i)?.[1] ??
    "";
  const automationType = parseAutomationType(getHintValue(block, "automationType"));
  const targetDate = normalizeDate(getHintValue(block, "targetDate"));
  const primaryJson = normalizeJsonTargetFile(getHintValue(block, "primaryJson"));
  const relatedJson = splitHintList(getHintValue(block, "relatedJson"))
    .map(normalizeJsonTargetFile)
    .filter((value): value is string => Boolean(value));

  return {
    automationType,
    targetDate,
    primaryJson,
    relatedJson,
  };
}

export function getHintTargetFiles(hint: DashboardImportHint): string[] {
  return [hint.primaryJson, ...hint.relatedJson]
    .filter((value): value is string => Boolean(value))
    .map((fileName) => `data/${fileName}`);
}

export function mergeHintTargetFiles(
  targetFiles: string[],
  hint: DashboardImportHint,
): string[] {
  return Array.from(new Set([...targetFiles, ...getHintTargetFiles(hint)]));
}

function getHintValue(block: string, key: string): string {
  return block.match(new RegExp(`${key}\\s*:\\s*([^\\n]+)`, "i"))?.[1]?.trim() ?? "";
}

function parseAutomationType(value: string): AutomationType | undefined {
  return knownAutomationTypes.includes(value as AutomationType)
    ? (value as AutomationType)
    : undefined;
}

function normalizeDate(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = value.match(/\b\d{4}[-./]\d{2}[-./]\d{2}\b/)?.[0];
  return date?.replace(/[./]/g, "-");
}

function splitHintList(value: string): string[] {
  return value
    .split(/[,/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeJsonTargetFile(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const fileName = value.trim().replace(/^data[\\/]/, "");
  return allowedJsonFiles.has(fileName) ? fileName : undefined;
}
