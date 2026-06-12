import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { appendAutomationImportLog, createImportBatchId } from "@/lib/import-log-utils";
import { buildJsonDiff } from "@/lib/json-diff-utils";
import {
  backupJsonFiles,
  readJsonFile,
  upsertJsonRecord,
  writeJsonFile,
} from "@/lib/json-persistence";
import { parseBulkAutomationImport } from "@/lib/parse-bulk-automation-import";
import {
  applySelectedChangesToPreview,
  summarizeSelectedChanges,
} from "@/lib/selected-import-utils";
import type {
  ABTestLog,
  AIFrameworkCheck,
  AiApplication,
  AutomationImportPreview,
  BriefLog,
  BulkAutomationImportPreview,
  DailyFocusPlan,
  EvidenceLog,
  EvidenceLogCreateInput,
  JsonFileDiff,
  LearningModule,
  Reflection,
  ReminderTask,
  SelectedImportChange,
} from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pastedText?: string;
      selectedDate?: string;
      manualAutomationType?: string;
      selectedChanges?: SelectedImportChange[];
      mode?: "dryRun" | "save";
      dryRun?: boolean;
    };
    const pastedText = body.pastedText?.trim() ?? "";
    if (!pastedText) {
      return NextResponse.json(
        { success: false, message: "pastedText가 비어 있습니다." },
        { status: 400 },
      );
    }

    const selectedDate = body.selectedDate || getTodayDate();
    const importBatchId = createImportBatchId("bulk-import", selectedDate);
    const context = await readContext();
    const parsed = parseBulkAutomationImport({
      pastedText,
      selectedDate,
      importBatchId,
      context,
      buildDiff: (previews) => buildExpectedDiffForPreviews(previews, context),
    });
    const dryRun = body.dryRun ?? body.mode !== "save";

    if (dryRun) {
      return NextResponse.json({
        success: true,
        ...publicBulkPayload(parsed),
        selectedSummary: summarizeSelectedChanges(parsed.diff, undefined),
        message: "Bulk Import 미리보기 완료",
      });
    }

    const selectedSave = Boolean(body.selectedChanges && body.selectedChanges.length > 0);
    const effectivePreviews = selectedSave
      ? parsed.previews
          .map((preview) =>
            applySelectedChangesToPreview(preview, parsed.diff, body.selectedChanges),
          )
          .filter(hasAnySaveTarget)
      : parsed.previews;
    const effectiveDiff = buildExpectedDiffForPreviews(effectivePreviews, context);
    const selectedSummary = summarizeSelectedChanges(parsed.diff, body.selectedChanges);
    const targetFiles = Array.from(new Set(effectivePreviews.flatMap((preview) => preview.targetFiles)));
    const backup = await backupJsonFiles(
      targetFiles.map((file) => file.replace(/^data\//, "")),
    );
    const afterContext = applyPreviewsToContext(context, effectivePreviews);
    const updatedFiles = await writeChangedContext(context, afterContext, targetFiles);
    const appliedDiff = buildContextDiff(context, afterContext, updatedFiles);
    const importLogId = `${importBatchId}-log`;

    await appendAutomationImportLog({
      id: importLogId,
      importedAt: new Date().toISOString(),
      source: `Bulk Automation Import (${parsed.detectedBlockCount} blocks)`,
      targetDate: selectedDate,
      status: "success",
      warnings: [
        ...parsed.warnings,
        selectedSave ? "selectedSave: true" : "selectedSave: false",
      ],
      updatedFiles,
    });

    for (const route of ["/", "/import", "/focus", "/learning", "/ai-ax", "/evidence", "/reflection"]) {
      revalidatePath(route);
    }

    return NextResponse.json({
      success: true,
      ...publicBulkPayload({
        ...parsed,
        previews: effectivePreviews,
        diff: effectiveDiff,
      }),
      diff: effectiveDiff,
      appliedDiff,
      selectedSummary,
      updatedFiles,
      backupPath: backup.backupPath,
      importLogId,
      message: "Bulk Import 저장 완료",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk Import 실패";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

function publicBulkPayload(parsed: BulkAutomationImportPreview) {
  return {
    importBatchId: parsed.importBatchId,
    detectedBlockCount: parsed.detectedBlockCount,
    parsedBlockCount: parsed.parsedBlockCount,
    unknownBlockCount: parsed.unknownBlockCount,
    automationTypes: parsed.automationTypes,
    targetFiles: parsed.targetFiles,
    blocks: parsed.blocks,
    preview: parsed,
    diff: parsed.diff,
    warnings: parsed.warnings,
  };
}

async function readContext() {
  return {
    dailyFocusPlans: await readJsonFile<DailyFocusPlan>("daily-focus-plans.json"),
    learningModules: await readJsonFile<LearningModule>("learning-modules.json"),
    aiApplications: await readJsonFile<AiApplication>("ai-applications.json"),
    reflections: await readJsonFile<Reflection>("reflections.json"),
    evidenceLogs: await readJsonFile<EvidenceLog>("evidence-logs.json"),
    briefLogs: await readJsonFile<BriefLog>("brief-logs.json"),
    abTestLogs: await readJsonFile<ABTestLog>("ab-test-logs.json"),
    aiFrameworkChecks: await readJsonFile<AIFrameworkCheck>("ai-framework-checks.json"),
    reminderTasks: await readJsonFile<ReminderTask>("reminder-tasks.json"),
  };
}

type ImportContext = Awaited<ReturnType<typeof readContext>>;

function buildExpectedDiffForPreviews(
  previews: AutomationImportPreview[],
  context: ImportContext,
): JsonFileDiff[] {
  const after = applyPreviewsToContext(context, previews);
  const targetFiles = Array.from(new Set(previews.flatMap((preview) => preview.targetFiles)));
  return buildContextDiff(context, after, targetFiles);
}

function applyPreviewsToContext(
  context: ImportContext,
  previews: AutomationImportPreview[],
): ImportContext {
  const next: ImportContext = {
    dailyFocusPlans: [...context.dailyFocusPlans],
    learningModules: [...context.learningModules],
    aiApplications: [...context.aiApplications],
    reflections: [...context.reflections],
    evidenceLogs: [...context.evidenceLogs],
    briefLogs: [...context.briefLogs],
    abTestLogs: [...context.abTestLogs],
    aiFrameworkChecks: [...context.aiFrameworkChecks],
    reminderTasks: [...context.reminderTasks],
  };
  const now = new Date().toISOString();

  for (const preview of previews) {
    if (preview.dailyFocusPlan) {
      next.dailyFocusPlans = upsertByDate(next.dailyFocusPlans, preview.dailyFocusPlan, "selectedDate");
    }
    if (preview.learningModule) {
      next.learningModules = upsertById(next.learningModules, preview.learningModule);
    }
    if (preview.aiApplication) {
      next.aiApplications = upsertByDate(next.aiApplications, preview.aiApplication);
    }
    if (preview.reflection) {
      const index = next.reflections.findIndex(
        (item) =>
          item.id === preview.reflection?.id ||
          item.reflectionDate === preview.targetDate ||
          item.targetDate === preview.targetDate,
      );
      const current = index >= 0 ? next.reflections[index] : undefined;
      next.reflections = writeAtIndex(next.reflections, createReflection(preview, now, current), index);
    }
    for (const input of preview.evidenceLogs) {
      const index = next.evidenceLogs.findIndex(
        (item) =>
          (item.evidenceDate === preview.targetDate || item.targetDate === preview.targetDate) &&
          item.title === input.title,
      );
      const current = index >= 0 ? next.evidenceLogs[index] : undefined;
      next.evidenceLogs = writeAtIndex(
        next.evidenceLogs,
        createEvidence(input, preview, now, current),
        index,
      );
    }
    if (preview.briefLog) {
      next.briefLogs = upsertByDate(next.briefLogs, preview.briefLog, "briefDate");
    }
    if (preview.abTestLog) {
      next.abTestLogs = upsertById(next.abTestLogs, preview.abTestLog);
    }
    if (preview.aiFrameworkCheck) {
      next.aiFrameworkChecks = upsertById(next.aiFrameworkChecks, preview.aiFrameworkCheck);
    }
    if (preview.reminderTask) {
      next.reminderTasks = upsertById(next.reminderTasks, preview.reminderTask);
    }
  }

  return next;
}

function createReflection(
  preview: AutomationImportPreview,
  now: string,
  current?: Reflection,
): Reflection {
  if (!preview.reflection) {
    throw new Error("reflection preview가 필요합니다.");
  }
  const completed = preview.reflection.completed ?? current?.completed ?? [];
  const misses = preview.reflection.misses ?? current?.misses ?? [];
  const learnings = preview.reflection.learnings ?? current?.learnings ?? [];
  const applicationPoints =
    preview.reflection.applicationPoints ?? current?.applicationPoints ?? [];
  return {
    id: current?.id ?? `reflection-${preview.targetDate}`,
    title: completed[0] ?? current?.title ?? `저녁 회고 - ${preview.targetDate}`,
    description: misses[0] ?? current?.description ?? "Bulk Import에서 분류된 회고",
    status: "done",
    progress: 100,
    category: current?.category ?? "Daily Reflection",
    targetDate: preview.targetDate,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: preview.reflection.relatedGoalId ?? current?.relatedGoalId,
    relatedModuleId: preview.reflection.relatedModuleId ?? current?.relatedModuleId,
    dataSource: "chatgpt_automation",
    futureTableName: "reflections",
    automationReady: true,
    completed,
    misses,
    blockers: misses,
    tomorrowFirstAction:
      preview.reflection.tomorrowFirstAction ?? current?.tomorrowFirstAction ?? "",
    tomorrowGoalDraft:
      preview.reflection.tomorrowGoalDraft ?? current?.tomorrowGoalDraft ?? "",
    learnings,
    applicationPoints,
    autoFillCandidates: ["tomorrowFirstAction", "tomorrowGoalDraft", "appliedToWork"],
    relatedFocusId: preview.reflection.relatedFocusId ?? current?.relatedFocusId,
    reflectionDate: preview.targetDate,
    appliedToWork: applicationPoints,
    sourceAutomationType: preview.automationType,
    importBatchId: preview.reflection.importBatchId,
    importBlockId: preview.reflection.importBlockId,
  };
}

function createEvidence(
  input: EvidenceLogCreateInput,
  preview: AutomationImportPreview,
  now: string,
  current?: EvidenceLog,
): EvidenceLog {
  const sourceUrl = input.sourceUrl || current?.sourceUrl || current?.artifactLink || "/import";
  const outputType = input.outputType || current?.outputType || "문서";
  const evidenceType = input.evidenceType || current?.evidenceType || outputType;
  const note = input.note ?? current?.note ?? "";
  return {
    id: current?.id ?? `evidence-${preview.targetDate}-${Date.now()}-${slugify(input.title)}`,
    title: input.title,
    description: note || current?.description || preview.sourceTitle,
    status: "done",
    progress: 100,
    category: evidenceType,
    targetDate: preview.targetDate,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: input.relatedGoalId || current?.relatedGoalId,
    relatedModuleId: input.relatedModuleId || current?.relatedModuleId,
    dataSource: "chatgpt_automation",
    futureTableName: "evidence_logs",
    automationReady: true,
    outputType,
    evidenceType,
    artifactLink: sourceUrl,
    sourceUrl,
    note,
    obsidianCandidatePath:
      current?.obsidianCandidatePath ??
      `LifeOS/Evidence/${preview.targetDate}-${slugify(input.title)}.md`,
    evidenceDate: preview.targetDate,
    relatedFocusId: input.relatedFocusId || current?.relatedFocusId,
    reviewStatus: current?.reviewStatus ?? "pending",
    sourceAutomationType: preview.automationType,
    originalText: input.originalText,
    importBatchId: input.importBatchId,
    importBlockId: input.importBlockId,
  };
}

async function writeChangedContext(before: ImportContext, after: ImportContext, targetFiles: string[]) {
  const updated = new Set<string>();
  const targetSet = new Set(targetFiles.map((file) => file.replace(/^data\//, "")));
  const writers: Array<[string, keyof ImportContext]> = [
    ["daily-focus-plans.json", "dailyFocusPlans"],
    ["learning-modules.json", "learningModules"],
    ["ai-applications.json", "aiApplications"],
    ["reflections.json", "reflections"],
    ["evidence-logs.json", "evidenceLogs"],
    ["brief-logs.json", "briefLogs"],
    ["ab-test-logs.json", "abTestLogs"],
    ["ai-framework-checks.json", "aiFrameworkChecks"],
    ["reminder-tasks.json", "reminderTasks"],
  ];

  for (const [fileName, key] of writers) {
    if (!targetSet.has(fileName)) {
      continue;
    }
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      await writeJsonFile(fileName, after[key] as Array<ImportContext[keyof ImportContext][number]>);
      updated.add(`data/${fileName}`);
    }
  }

  return Array.from(updated);
}

function buildContextDiff(before: ImportContext, after: ImportContext, targetFiles: string[]) {
  const targetSet = new Set(targetFiles.map((file) => file.replace(/^data\//, "")));
  const diffs = [
    buildJsonDiff("daily-focus-plans.json", toRecords(before.dailyFocusPlans), toRecords(after.dailyFocusPlans), ["selectedDate", "targetDate", "id"]),
    buildJsonDiff("learning-modules.json", toRecords(before.learningModules), toRecords(after.learningModules), ["id", "title"]),
    buildJsonDiff("ai-applications.json", toRecords(before.aiApplications), toRecords(after.aiApplications), ["targetDate", "workProblem", "title", "id"]),
    buildJsonDiff("reflections.json", toRecords(before.reflections), toRecords(after.reflections), ["reflectionDate", "targetDate", "id"]),
    buildJsonDiff("evidence-logs.json", toRecords(before.evidenceLogs), toRecords(after.evidenceLogs), ["evidenceDate|title", "targetDate|title", "id", "title"]),
    buildJsonDiff("brief-logs.json", toRecords(before.briefLogs), toRecords(after.briefLogs), ["briefDate", "targetDate", "id"]),
    buildJsonDiff("ab-test-logs.json", toRecords(before.abTestLogs), toRecords(after.abTestLogs), ["testDate|variant", "targetDate|phrase", "id"]),
    buildJsonDiff("ai-framework-checks.json", toRecords(before.aiFrameworkChecks), toRecords(after.aiFrameworkChecks), ["checkDate|topic", "targetDate|topic", "id"]),
    buildJsonDiff("reminder-tasks.json", toRecords(before.reminderTasks), toRecords(after.reminderTasks), ["reminderDate|title", "targetDate|title", "id"]),
  ];
  return diffs.filter((diff) => targetSet.has(diff.fileName)).filter((diff) => diff.added.length || diff.updated.length || diff.removed.length);
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  return upsertJsonRecord(items, item, (current) => current.id);
}

function upsertByDate<T extends { id: string; targetDate: string }>(
  items: T[],
  item: T,
  dateField?: keyof T,
): T[] {
  return upsertJsonRecord(items, item, (current) => [
    current.id,
    current.targetDate,
    dateField ? String(current[dateField]) : undefined,
  ]);
}

function writeAtIndex<T>(items: T[], item: T, index: number): T[] {
  const next = [...items];
  if (index >= 0) {
    next[index] = { ...next[index], ...item };
  } else {
    next.unshift(item);
  }
  return next;
}

function hasAnySaveTarget(preview: AutomationImportPreview) {
  return Boolean(
    preview.targetFiles.length ||
      preview.dailyFocusPlan ||
      preview.learningModule ||
      preview.aiApplication ||
      preview.reflection ||
      preview.evidenceLogs.length ||
      preview.briefLog ||
      preview.abTestLog ||
      preview.aiFrameworkCheck ||
      preview.reminderTask,
  );
}

function toRecords<T extends object>(items: T[]): Array<Record<string, unknown>> {
  return items.map((item) => item as Record<string, unknown>);
}

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function slugify(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "automation";
}
