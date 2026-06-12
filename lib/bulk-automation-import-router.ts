import { parseAutomationUnified, type AutomationParseContext } from "./parse-automation-unified";
import { parseDailyFocusUpdate } from "./parse-daily-focus-update";
import { parseDailyOperationText } from "./parse-daily-operation-text";
import type { AutomationBlock, AutomationImportPreview } from "./types";

export function routeAutomationBlock(
  block: AutomationBlock,
  importBatchId: string,
  context: AutomationParseContext,
): AutomationImportPreview | null {
  if (block.automationType === "unknown") {
    return null;
  }

  if (block.automationType === "daily_focus_update") {
    return enrichPreview(parseDailyFocusUpdate(block, context), block, importBatchId);
  }

  if (block.automationType === "daily_operation_log") {
    return enrichPreview(parseDailyOperationLog(block, context), block, importBatchId);
  }

  return enrichPreview(parseAutomationUnified(block.rawText, context), block, importBatchId);
}

function parseDailyOperationLog(
  block: AutomationBlock,
  context: AutomationParseContext,
): AutomationImportPreview {
  const focus = context.dailyFocusPlans?.find(
    (item) => item.selectedDate === block.targetDate || item.targetDate === block.targetDate,
  );
  const reflection = context.reflections?.find(
    (item) => item.reflectionDate === block.targetDate || item.targetDate === block.targetDate,
  );
  const parsed = parseDailyOperationText({
    pastedText: block.rawText,
    selectedDate: block.targetDate,
    focus,
    existingReflection: reflection,
  });

  return {
    automationType: "daily_operation_log",
    targetDate: parsed.selectedDate,
    sourceTitle: block.sourceTitle,
    targetFiles: ["data/reflections.json", "data/evidence-logs.json"],
    reflection: parsed.reflection,
    evidenceLogs: parsed.evidenceLogs,
    missingFields: parsed.missingFields,
    autoFilledFields: parsed.autoFilledFields,
    warnings: [],
    overwrite: { reflection: parsed.overwrite.reflection },
  };
}

function enrichPreview(
  preview: AutomationImportPreview,
  block: AutomationBlock,
  importBatchId: string,
): AutomationImportPreview {
  const apply = <T extends object>(record: T | undefined): T | undefined => {
    if (!record) {
      return undefined;
    }
    return {
      ...record,
      dataSource: "chatgpt_automation",
      sourceAutomationType: block.automationType,
      originalText: block.rawText.slice(0, 4000),
      importBatchId,
      importBlockId: block.importBlockId,
    };
  };
  const applyWeekly = <T extends { importBatchId?: string }>(
    record: T | undefined,
  ): T | undefined => {
    if (!record) {
      return undefined;
    }
    return { ...record, importBatchId };
  };

  return {
    ...preview,
    automationType: block.automationType,
    targetDate: preview.targetDate || block.targetDate,
    sourceTitle: block.sourceTitle,
    dailyFocusPlan: apply(preview.dailyFocusPlan),
    learningModule: apply(preview.learningModule),
    aiApplication: apply(preview.aiApplication),
    briefLog: apply(preview.briefLog),
    abTestLog: apply(preview.abTestLog),
    aiFrameworkCheck: apply(preview.aiFrameworkCheck),
    reminderTask: apply(preview.reminderTask),
    weeklyNewsSummary: applyWeekly(preview.weeklyNewsSummary),
    investmentReportLog: applyWeekly(preview.investmentReportLog),
    investmentSummaryLog: applyWeekly(preview.investmentSummaryLog),
    reflection: preview.reflection
      ? {
          ...preview.reflection,
          sourceAutomationType: block.automationType,
          originalText: block.rawText.slice(0, 4000),
          importBatchId,
          importBlockId: block.importBlockId,
        }
      : undefined,
    evidenceLogs: preview.evidenceLogs.map((item) => ({
      ...item,
      sourceAutomationType: block.automationType,
      originalText: block.rawText.slice(0, 4000),
      importBatchId,
      importBlockId: block.importBlockId,
    })),
  };
}
