import { appendJsonRecord, readJsonFile, writeJsonFile } from "./json-persistence";
import type { AutomationImportLog } from "./types";

export async function appendAutomationImportLog(
  log: AutomationImportLog,
): Promise<void> {
  let logs: AutomationImportLog[] = [];
  try {
    logs = await readJsonFile<AutomationImportLog>("automation-import-logs.json");
  } catch {
    logs = [];
  }

  await writeJsonFile("automation-import-logs.json", appendJsonRecord(logs, log));
}

export function createImportBatchId(prefix = "automation-import", targetDate?: string): string {
  const datePart = targetDate ?? getTodayDate();
  return `${prefix}-${datePart}-${Date.now()}`;
}

export function createImportBlockId(importBatchId: string, index: number): string {
  return `${importBatchId}-block-${String(index + 1).padStart(2, "0")}`;
}

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
