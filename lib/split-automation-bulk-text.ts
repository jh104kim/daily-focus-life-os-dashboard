import { parseDashboardImportHint } from "./dashboard-import-hint";
import { detectAutomationType } from "./detect-automation-type";
import type { AutomationBlock } from "./types";

const startPatterns = [
  /^#\s+/,
  /^#{1,2}\s+(Oflow Morning Brief|AI Education Focus Dashboard|저녁 회고|Daily Focus A\/B|AI Framework Check|산장 예약|예약|Daily Focus Update|Daily Operation Log)/i,
];

const fallbackStartPatterns = [
  /^(오늘의 문구|오늘의 주제|예약 제목|Daily Focus Update|Daily Operation Log)\s*[:：]?/i,
];

export function splitAutomationBulkText(
  pastedText: string,
  importBatchId: string,
  selectedDate: string,
): AutomationBlock[] {
  const normalized = pastedText.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const headingStarts = findStartLines(lines, startPatterns);
  const fallbackStarts = findStartLines(lines, fallbackStartPatterns);
  const starts = headingStarts.length > 1 ? headingStarts : fallbackStarts;

  const uniqueStarts = Array.from(new Set(starts.map((item) => item.index)))
    .filter((index) => isLikelyAutomationStart(lines[index]) || index !== 0)
    .sort((a, b) => a - b);
  const ranges = uniqueStarts.length > 0 ? uniqueStarts : [0];

  return ranges
    .map((start, blockIndex) => {
      const end = ranges[blockIndex + 1] ?? lines.length;
      const rawText = lines.slice(start, end).join("\n").trim();
      const hint = parseDashboardImportHint(rawText);
      const automationType = detectAutomationType(rawText);
      const targetDate = hint.targetDate || extractDate(rawText) || selectedDate;
      return {
        importBlockId: `${importBatchId}-block-${blockIndex + 1}`,
        rawText,
        automationType,
        targetDate,
        sourceTitle: getSourceTitle(rawText, automationType, targetDate),
      };
    })
    .filter((block) => block.rawText.length > 0);
}

function findStartLines(lines: string[], patterns: RegExp[]) {
  const starts: Array<{ line: string; index: number }> = [];
  let inFence = false;

  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }
    if (patterns.some((pattern) => pattern.test(line.trim()))) {
      starts.push({ line, index });
    }
  });

  return starts;
}

function isLikelyAutomationStart(line: string) {
  const trimmed = line.trim();
  return (
    /^#\s+\d+\./.test(trimmed) ||
    startPatterns.slice(1).some((pattern) => pattern.test(trimmed)) ||
    fallbackStartPatterns.some((pattern) => pattern.test(trimmed))
  );
}

function extractDate(text: string): string | undefined {
  const normalizedDate = text.match(/\b\d{4}[./]\d{2}[./]\d{2}\b/)?.[0]?.replace(/[./]/g, "-");
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? normalizedDate;
}

function getSourceTitle(text: string, automationType: string, targetDate: string): string {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("#"))
      ?.replace(/^#+\s*/, "") || `${automationType} - ${targetDate}`
  );
}
