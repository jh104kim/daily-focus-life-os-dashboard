import path from "node:path";

export const DATA_FILE_PATHS = {
  "daily-focus-plans.json": "daily-focus-plans.json",
  "goals.json": "goals.json",
  "learning-modules.json": "learning-modules.json",
  "ai-applications.json": "ai-applications.json",
  "reflections.json": "reflections.json",
  "evidence-logs.json": "evidence-logs.json",
  "brief-logs.json": "brief-logs.json",
  "ab-test-logs.json": "ab-test-logs.json",
  "ai-framework-checks.json": "ai-framework-checks.json",
  "reminder-tasks.json": "reminder-tasks.json",
  "automation-import-logs.json": "automation-import-logs.json",
  "automation-roadmap.json": "automation-roadmap.json",
  "data-source-status.json": "data-source-status.json",
  "news-summary-logs.json": "news-summary-logs.json",
  "investment-report-logs.json": "investment-report-logs.json",
  "investment-summary-logs.json": "investment-summary-logs.json",
} as const;

export type KnownDataFile = keyof typeof DATA_FILE_PATHS;

const dataDir = path.join(process.cwd(), "data");

export function getDataFilePath(fileName: string): string {
  const normalized = normalizeDataFileName(fileName);
  if (!isKnownDataFile(normalized)) {
    throw new Error(`알 수 없는 data 파일입니다: ${fileName}`);
  }
  return path.join(dataDir, DATA_FILE_PATHS[normalized]);
}

export function getKnownDataFiles(): KnownDataFile[] {
  return Object.keys(DATA_FILE_PATHS) as KnownDataFile[];
}

export function isKnownDataFile(fileName: string): fileName is KnownDataFile {
  return Object.hasOwn(DATA_FILE_PATHS, normalizeDataFileName(fileName));
}

export function normalizeDataFileName(fileName: string): string {
  return fileName.replace(/^data[\\/]/, "");
}
