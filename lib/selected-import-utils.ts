import type {
  AutomationImportPreview,
  EvidenceLogCreateInput,
  JsonFileDiff,
  ReflectionUpsertInput,
  SelectedImportChange,
  SelectedImportSummary,
} from "./types";

type PreviewRecordKey =
  | "dailyFocusPlan"
  | "learningModule"
  | "aiApplication"
  | "briefLog"
  | "abTestLog"
  | "aiFrameworkCheck"
  | "reminderTask";

const fileToPreviewKey: Record<string, PreviewRecordKey> = {
  "daily-focus-plans.json": "dailyFocusPlan",
  "learning-modules.json": "learningModule",
  "ai-applications.json": "aiApplication",
  "brief-logs.json": "briefLog",
  "ab-test-logs.json": "abTestLog",
  "ai-framework-checks.json": "aiFrameworkCheck",
  "reminder-tasks.json": "reminderTask",
};

const requiredFields = new Set([
  "id",
  "title",
  "description",
  "status",
  "progress",
  "category",
  "targetDate",
  "createdAt",
  "updatedAt",
  "dataSource",
  "futureTableName",
  "automationReady",
]);

const inputIdentityFields = new Set([
  "id",
  "selectedDate",
  "title",
  "outputType",
  "relatedFocusId",
  "relatedGoalId",
  "relatedModuleId",
  "sourceAutomationType",
  "originalText",
  "importBatchId",
  "importBlockId",
]);

export function applySelectedChangesToPreview(
  preview: AutomationImportPreview,
  diff: JsonFileDiff[],
  selectedChanges?: SelectedImportChange[],
): AutomationImportPreview {
  if (!selectedChanges || selectedChanges.length === 0) {
    return preview;
  }

  const selected = selectedChanges;
  const next: AutomationImportPreview = {
    ...preview,
    targetFiles: preview.targetFiles.filter((file) =>
      hasSelectedFileChange(file, selected),
    ),
    evidenceLogs: applyEvidenceSelection(preview, selected),
    reflection: applyReflectionSelection(preview, selected),
  };

  for (const [fileName, previewKey] of Object.entries(fileToPreviewKey)) {
    const fullFileName = `data/${fileName}`;
    const value = preview[previewKey];
    if (!value) {
      continue;
    }
    const matching = selected.find((change) =>
      matchesRecordChange(
        change,
        fileName,
        fullFileName,
        value as unknown as Record<string, unknown>,
      ),
    );

    if (!matching) {
      next[previewKey] = undefined;
      continue;
    }

    if (matching.action === "update" && matching.selectedFields?.length) {
      next[previewKey] = pickSelectedRecordFields(value, matching.selectedFields) as never;
    }
  }

  const summary = summarizeSelectedChanges(diff, selected);
  return {
    ...next,
    warnings: [
      ...next.warnings,
      summary.selectedSave ? "선택 저장 모드: 선택된 변경 사항만 저장합니다." : "",
    ].filter(Boolean),
  };
}

export function summarizeSelectedChanges(
  diff: JsonFileDiff[],
  selectedChanges?: SelectedImportChange[],
): SelectedImportSummary {
  const selectedSave = Boolean(selectedChanges && selectedChanges.length > 0);
  if (!selectedSave) {
    return summarizeAllDiff(diff);
  }

  const selected = selectedChanges ?? [];
  const savedFileCount = new Set(selected.map((change) => normalizeFileName(change.fileName))).size;
  const savedRecordCount = selected.length;
  const savedFieldCount = selected.reduce(
    (sum, change) =>
      sum +
      (change.action === "update"
        ? change.selectedFields?.length ?? countChangedFields(diff, change)
        : 0),
    0,
  );
  const totalRecords = diff.reduce(
    (sum, file) => sum + file.added.length + file.updated.length,
    0,
  );

  return {
    selectedSave,
    savedFileCount,
    savedRecordCount,
    savedFieldCount,
    excludedRecordCount: Math.max(0, totalRecords - savedRecordCount),
  };
}

function summarizeAllDiff(diff: JsonFileDiff[]): SelectedImportSummary {
  const savedRecordCount = diff.reduce(
    (sum, file) => sum + file.added.length + file.updated.length,
    0,
  );
  const savedFieldCount = diff.reduce(
    (sum, file) =>
      sum +
      file.updated.reduce((fieldSum, item) => fieldSum + item.changedFields.length, 0),
    0,
  );

  return {
    selectedSave: false,
    savedFileCount: diff.length,
    savedRecordCount,
    savedFieldCount,
    excludedRecordCount: 0,
  };
}

function applyEvidenceSelection(
  preview: AutomationImportPreview,
  selectedChanges: SelectedImportChange[],
) {
  return preview.evidenceLogs
    .map((evidence) => {
      const matching = selectedChanges.find((change) =>
        matchesRecordChange(change, "evidence-logs.json", "data/evidence-logs.json", {
          title: evidence.title,
          targetDate: evidence.selectedDate,
        }),
      );
      if (!matching) {
        return undefined;
      }
      if (matching.action === "update" && matching.selectedFields?.length) {
        return pickSelectedInputFields(evidence, matching.selectedFields);
      }
      return evidence;
    })
    .filter((item): item is EvidenceLogCreateInput => Boolean(item));
}

function applyReflectionSelection(
  preview: AutomationImportPreview,
  selectedChanges: SelectedImportChange[],
): ReflectionUpsertInput | undefined {
  if (!preview.reflection) {
    return undefined;
  }
  const matching = selectedChanges.find((change) =>
    matchesRecordChange(change, "reflections.json", "data/reflections.json", {
      id: preview.reflection?.id,
      title: preview.reflection?.completed[0],
      targetDate: preview.reflection?.selectedDate,
    }),
  );
  if (!matching) {
    return undefined;
  }
  if (matching.action === "update" && matching.selectedFields?.length) {
    return pickSelectedInputFields(preview.reflection, matching.selectedFields);
  }
  return preview.reflection;
}

function pickSelectedRecordFields<T extends object>(record: T, selectedFields: string[]): T {
  const source = record as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const field of Object.keys(source)) {
    if (requiredFields.has(field) || selectedFields.includes(field)) {
      picked[field] = source[field];
    }
  }
  return picked as T;
}

function pickSelectedInputFields<T extends object>(record: T, selectedFields: string[]): T {
  const source = record as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const field of Object.keys(source)) {
    if (inputIdentityFields.has(field) || selectedFields.includes(field)) {
      picked[field] = source[field];
    }
  }
  return picked as T;
}

function hasSelectedFileChange(fileName: string, selectedChanges: SelectedImportChange[]) {
  const normalized = normalizeFileName(fileName);
  return selectedChanges.some((change) => normalizeFileName(change.fileName) === normalized);
}

function matchesRecordChange(
  change: SelectedImportChange,
  fileName: string,
  fullFileName: string,
  record: Record<string, unknown>,
) {
  if (
    normalizeFileName(change.fileName) !== normalizeFileName(fileName) &&
    normalizeFileName(change.fileName) !== normalizeFileName(fullFileName)
  ) {
    return false;
  }

  return (
    (change.id && change.id === record.id) ||
    (change.title && change.title === record.title) ||
    (change.targetDate && change.targetDate === record.targetDate) ||
    (!change.id && !change.title && !change.targetDate)
  );
}

function countChangedFields(diff: JsonFileDiff[], change: SelectedImportChange) {
  const file = diff.find(
    (item) => normalizeFileName(item.fileName) === normalizeFileName(change.fileName),
  );
  const item = file?.updated.find(
    (record) =>
      (change.id && change.id === record.id) ||
      (change.title && change.title === record.title) ||
      (change.targetDate && change.targetDate === record.targetDate),
  );
  return item?.changedFields.length ?? 0;
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/^data\//, "");
}
