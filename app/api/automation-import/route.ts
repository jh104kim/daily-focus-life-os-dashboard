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
import { parseAutomationUnified } from "@/lib/parse-automation-unified";
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
      dryRun?: boolean;
      selectedChanges?: SelectedImportChange[];
    };
    const pastedText = body.pastedText?.trim() ?? "";

    if (!pastedText) {
      return NextResponse.json(
        { success: false, message: "pastedText가 비어 있습니다." },
        { status: 400 },
      );
    }

    const context = await readContext();
    const preview = parseAutomationUnified(pastedText, {
      selectedDate: body.selectedDate,
      ...context,
    });
    const diff =
      preview.automationType === "unknown" ? [] : buildExpectedDiff(preview, context);
    const removalWarnings = diff
      .filter((file) => file.removed.length > 0)
      .map((file) => `${file.fileName}: 삭제 예상 ${file.removed.length}건`);

    if (body.dryRun) {
      return NextResponse.json({
        success: true,
        parsed: preview,
        diff,
        updatedFiles: [],
        warnings: removalWarnings,
        message: "통합 Import 미리보기 완료",
      });
    }

    if (preview.automationType === "unknown") {
      return NextResponse.json(
        {
          success: false,
          parsed: preview,
          diff: [],
          updatedFiles: [],
          message: "자동화 유형을 판별하지 못해 저장하지 않았습니다.",
        },
        { status: 400 },
      );
    }

    const selectedSave = Boolean(body.selectedChanges && body.selectedChanges.length > 0);
    const effectivePreview = selectedSave
      ? applySelectedChangesToPreview(preview, diff, body.selectedChanges)
      : preview;
    const effectiveDiff = selectedSave ? buildExpectedDiff(effectivePreview, context) : diff;
    const selectedSummary = summarizeSelectedChanges(diff, body.selectedChanges);

    const backup = await backupJsonFiles(
      effectivePreview.targetFiles.map((file) => file.replace(/^data\//, "")),
    );
    const updatedFiles = await persistPreview(effectivePreview);
    const afterContext = await readContext();
    const appliedDiff = buildContextDiff(context, afterContext, updatedFiles);
    const importLogId = createImportBatchId("automation-import", preview.targetDate);
    await appendAutomationImportLog({
      id: importLogId,
      importedAt: new Date().toISOString(),
      source: preview.sourceTitle,
      targetDate: preview.targetDate,
      status: "success",
      warnings: [
        ...preview.warnings,
        ...preview.missingFields,
        selectedSave ? "selectedSave: true" : "selectedSave: false",
      ],
      updatedFiles,
    });

    for (const route of ["/", "/import", "/focus", "/learning", "/ai-ax", "/evidence", "/reflection"]) {
      revalidatePath(route);
    }

    return NextResponse.json({
      success: true,
      parsed: effectivePreview,
      diff: effectiveDiff,
      appliedDiff,
      updatedFiles,
      backupPath: backup.backupPath,
      importLogId,
      selectedSummary,
      message: "통합 Import 저장 완료",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "통합 Import 저장 실패";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
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

async function persistPreview(preview: AutomationImportPreview): Promise<string[]> {
  const updated = new Set<string>();

  if (preview.dailyFocusPlan) {
    await upsertJsonByDate("daily-focus-plans.json", preview.dailyFocusPlan, "selectedDate");
    updated.add("data/daily-focus-plans.json");
  }
  if (preview.learningModule) {
    await upsertJsonById("learning-modules.json", preview.learningModule);
    updated.add("data/learning-modules.json");
  }
  if (preview.aiApplication) {
    await upsertJsonByDate("ai-applications.json", preview.aiApplication);
    updated.add("data/ai-applications.json");
  }
  if (preview.reflection) {
    await upsertReflection(preview);
    updated.add("data/reflections.json");
  }
  if (preview.evidenceLogs.length > 0) {
    await upsertEvidenceLogs(preview);
    updated.add("data/evidence-logs.json");
  }
  if (preview.briefLog) {
    await upsertJsonByDate("brief-logs.json", preview.briefLog, "briefDate");
    updated.add("data/brief-logs.json");
  }
  if (preview.abTestLog) {
    await upsertJsonById("ab-test-logs.json", preview.abTestLog);
    updated.add("data/ab-test-logs.json");
  }
  if (preview.aiFrameworkCheck) {
    await upsertJsonById("ai-framework-checks.json", preview.aiFrameworkCheck);
    updated.add("data/ai-framework-checks.json");
  }
  if (preview.reminderTask) {
    await upsertJsonById("reminder-tasks.json", preview.reminderTask);
    updated.add("data/reminder-tasks.json");
  }

  return Array.from(updated);
}

type ImportContext = Awaited<ReturnType<typeof readContext>>;

function buildExpectedDiff(
  preview: AutomationImportPreview,
  context: ImportContext,
): JsonFileDiff[] {
  const now = new Date().toISOString();
  const expected: ImportContext = {
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

  if (preview.dailyFocusPlan) {
    expected.dailyFocusPlans = upsertByDate(
      expected.dailyFocusPlans,
      preview.dailyFocusPlan,
      "selectedDate",
    );
  }
  if (preview.learningModule) {
    expected.learningModules = upsertById(expected.learningModules, preview.learningModule);
  }
  if (preview.aiApplication) {
    expected.aiApplications = upsertByDate(expected.aiApplications, preview.aiApplication);
  }
  if (preview.reflection) {
    const index = expected.reflections.findIndex(
      (item) =>
        item.id === preview.reflection?.id ||
        item.reflectionDate === preview.targetDate ||
        item.targetDate === preview.targetDate,
    );
    const current = index >= 0 ? expected.reflections[index] : undefined;
    expected.reflections = writeAtIndex(
      expected.reflections,
      createReflectionRecord(preview, now, current),
      index,
    );
  }
  if (preview.evidenceLogs.length > 0) {
    let nextEvidence = [...expected.evidenceLogs];
    for (const input of preview.evidenceLogs) {
      const index = nextEvidence.findIndex(
        (item) =>
          (item.evidenceDate === preview.targetDate ||
            item.targetDate === preview.targetDate) &&
          item.title === input.title,
      );
      const current = index >= 0 ? nextEvidence[index] : undefined;
      nextEvidence = writeAtIndex(
        nextEvidence,
        createEvidenceLog(input, preview, now, current),
        index,
      );
    }
    expected.evidenceLogs = nextEvidence;
  }
  if (preview.briefLog) {
    expected.briefLogs = upsertByDate(expected.briefLogs, preview.briefLog, "briefDate");
  }
  if (preview.abTestLog) {
    expected.abTestLogs = upsertById(expected.abTestLogs, preview.abTestLog);
  }
  if (preview.aiFrameworkCheck) {
    expected.aiFrameworkChecks = upsertById(
      expected.aiFrameworkChecks,
      preview.aiFrameworkCheck,
    );
  }
  if (preview.reminderTask) {
    expected.reminderTasks = upsertById(expected.reminderTasks, preview.reminderTask);
  }

  return buildContextDiff(context, expected, preview.targetFiles);
}

function buildContextDiff(
  before: ImportContext,
  after: ImportContext,
  targetFiles: string[],
): JsonFileDiff[] {
  const targetSet = new Set(targetFiles.map((file) => file.replace(/^data\//, "")));
  const diffs = [
    buildJsonDiff("daily-focus-plans.json", toRecords(before.dailyFocusPlans), toRecords(after.dailyFocusPlans), [
      "selectedDate",
      "targetDate",
      "id",
    ]),
    buildJsonDiff("learning-modules.json", toRecords(before.learningModules), toRecords(after.learningModules), [
      "id",
      "title",
    ]),
    buildJsonDiff("ai-applications.json", toRecords(before.aiApplications), toRecords(after.aiApplications), [
      "targetDate",
      "workProblem",
      "title",
      "id",
    ]),
    buildJsonDiff("reflections.json", toRecords(before.reflections), toRecords(after.reflections), [
      "reflectionDate",
      "targetDate",
      "id",
    ]),
    buildJsonDiff("evidence-logs.json", toRecords(before.evidenceLogs), toRecords(after.evidenceLogs), [
      "evidenceDate|title",
      "targetDate|title",
      "id",
      "title",
    ]),
    buildJsonDiff("brief-logs.json", toRecords(before.briefLogs), toRecords(after.briefLogs), [
      "briefDate",
      "targetDate",
      "id",
    ]),
    buildJsonDiff("ab-test-logs.json", toRecords(before.abTestLogs), toRecords(after.abTestLogs), [
      "testDate|variant",
      "targetDate|phrase",
      "id",
    ]),
    buildJsonDiff(
      "ai-framework-checks.json",
      toRecords(before.aiFrameworkChecks),
      toRecords(after.aiFrameworkChecks),
      ["checkDate|topic", "targetDate|topic", "id"],
    ),
    buildJsonDiff("reminder-tasks.json", toRecords(before.reminderTasks), toRecords(after.reminderTasks), [
      "reminderDate|title",
      "targetDate|title",
      "id",
    ]),
  ];

  return diffs
    .filter((diff) => targetSet.has(diff.fileName))
    .filter(
      (diff) =>
        diff.added.length > 0 || diff.updated.length > 0 || diff.removed.length > 0,
    );
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
    next[index] = item;
  } else {
    next.unshift(item);
  }
  return next;
}

function toRecords<T extends object>(items: T[]): Array<Record<string, unknown>> {
  return items.map((item) => item as Record<string, unknown>);
}

async function upsertReflection(preview: AutomationImportPreview) {
  if (!preview.reflection) {
    return;
  }
  const file = "reflections.json";
  const items = await readJsonFile<Reflection>(file);
  const index = items.findIndex(
    (item) =>
      item.id === preview.reflection?.id ||
      item.reflectionDate === preview.targetDate ||
      item.targetDate === preview.targetDate,
  );
  const current = index >= 0 ? items[index] : undefined;
  const now = new Date().toISOString();
  const next = createReflectionRecord(preview, now, current);
  await writeJsonFile(
    file,
    upsertJsonRecord(items, next, (item) => [
      item.id,
      item.reflectionDate,
      item.targetDate,
    ]),
  );
}

function createReflectionRecord(
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
    description: misses[0] ?? current?.description ?? "자동화 Import에서 분류된 회고",
    status: "done",
    progress: 100,
    category: current?.category ?? "Daily Reflection",
    targetDate: preview.targetDate,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: preview.reflection.relatedGoalId ?? current?.relatedGoalId,
    relatedModuleId: preview.reflection.relatedModuleId ?? current?.relatedModuleId,
    dataSource: "mock",
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
  };
}

async function upsertEvidenceLogs(preview: AutomationImportPreview) {
  const file = "evidence-logs.json";
  const items = await readJsonFile<EvidenceLog>(file);
  const now = new Date().toISOString();

  for (const input of preview.evidenceLogs) {
    const index = items.findIndex(
      (item) =>
        (item.evidenceDate === preview.targetDate || item.targetDate === preview.targetDate) &&
        item.title === input.title,
    );
    const current = index >= 0 ? items[index] : undefined;
    const item = createEvidenceLog(input, preview, now, current);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
  }

  await writeJsonFile(file, items);
}

function createEvidenceLog(
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
    dataSource: "mock",
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
  };
}

async function upsertJsonById<T extends { id: string }>(fileName: string, item: T) {
  const items = await readJsonFile<T>(fileName);
  await writeJsonFile(fileName, upsertJsonRecord(items, item, (current) => current.id));
}

async function upsertJsonByDate<T extends { id: string; targetDate: string }>(
  fileName: string,
  item: T,
  dateField?: keyof T,
) {
  const items = await readJsonFile<T>(fileName);
  await writeJsonFile(
    fileName,
    upsertJsonRecord(items, item, (current) => [
      current.id,
      current.targetDate,
      dateField ? String(current[dateField]) : undefined,
    ]),
  );
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "automation";
}
