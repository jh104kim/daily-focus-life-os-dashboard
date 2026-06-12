import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseAutomationText, withOverwriteInfo } from "@/lib/parse-automation-text";
import { getMonthKey, getWeekKey } from "@/lib/dashboard-utils";
import type {
  AiApplication,
  AutomationImportLog,
  DailyFocusPlan,
  EvidenceLog,
  ImportDailyFocusResponse,
  LearningModule,
  ParsedAutomationImport,
} from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const importTargetFiles = [
  "daily-focus-plans.json",
  "learning-modules.json",
  "ai-applications.json",
  "evidence-logs.json",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pastedText?: string; dryRun?: boolean };
    const pastedText = body.pastedText?.trim();

    if (!pastedText) {
      return NextResponse.json<ImportDailyFocusResponse>(
        {
          success: false,
          message: "pastedText가 비어 있습니다.",
        },
        { status: 400 },
      );
    }

    const parsedBase = parseAutomationText(pastedText);
    const parsed = withOverwriteInfo(parsedBase, await getOverwriteInfo(parsedBase));

    if (body.dryRun) {
      return NextResponse.json<ImportDailyFocusResponse>({
        success: true,
        parsed,
        updatedFiles: [],
        message: "미리보기 완료",
      });
    }

    const updatedFiles = await persistParsedImport(parsed);
    await appendImportLog({
      id: `import-log-${parsed.date}-${Date.now()}`,
      importedAt: new Date().toISOString(),
      source: parsed.sourceTitle,
      targetDate: parsed.date,
      status: "success",
      warnings: parsed.missingFields,
      updatedFiles,
    });

    for (const route of ["/", "/focus", "/learning", "/ai-ax", "/evidence"]) {
      revalidatePath(route);
    }

    return NextResponse.json<ImportDailyFocusResponse>({
      success: true,
      parsed,
      updatedFiles,
      message: "저장 완료",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 저장 오류";

    return NextResponse.json<ImportDailyFocusResponse>(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}

async function persistParsedImport(parsed: ParsedAutomationImport): Promise<string[]> {
  const now = new Date().toISOString();
  await backupImportFiles(now);
  const moduleId = await upsertLearningModule(parsed, now);
  await upsertDailyFocusPlan(parsed, moduleId, now);
  await upsertAiApplication(parsed, moduleId, now);
  await upsertEvidenceLog(parsed, moduleId, now);

  return [
    "data/daily-focus-plans.json",
    "data/learning-modules.json",
    "data/ai-applications.json",
    "data/evidence-logs.json",
  ];
}

async function getOverwriteInfo(
  parsed: ParsedAutomationImport,
): Promise<ParsedAutomationImport["overwrite"]> {
  const [dailyFocusPlans, learningModules, aiApplications, evidenceLogs] =
    await Promise.all([
      readJsonFile<DailyFocusPlan>("daily-focus-plans.json"),
      readJsonFile<LearningModule>("learning-modules.json"),
      readJsonFile<AiApplication>("ai-applications.json"),
      readJsonFile<EvidenceLog>("evidence-logs.json"),
    ]);
  const moduleTitle = normalizeText(parsed.learningModuleTitle);

  return {
    dailyFocusPlan: dailyFocusPlans.some(
      (item) => item.id === `focus-import-${parsed.date}` || item.targetDate === parsed.date,
    ),
    aiApplication: aiApplications.some(
      (item) => item.id === `ai-import-${parsed.date}` || item.targetDate === parsed.date,
    ),
    evidenceLog: evidenceLogs.some((item) => item.id === `evidence-import-${parsed.date}`),
    learningModule: learningModules.some((item) => normalizeText(item.title) === moduleTitle),
  };
}

async function upsertDailyFocusPlan(
  parsed: ParsedAutomationImport,
  relatedModuleId: string,
  now: string,
) {
  const file = "daily-focus-plans.json";
  const items = await readJsonFile<DailyFocusPlan>(file);
  const id = `focus-import-${parsed.date}`;
  const existingIndex = items.findIndex(
    (item) => item.id === id || item.targetDate === parsed.date,
  );
  const previous = existingIndex >= 0 ? items[existingIndex] : undefined;
  const item: DailyFocusPlan = {
    id: previous?.id ?? id,
    title: parsed.coreGoal,
    description: parsed.remainingTasks,
    status: "in_progress",
    progress: parsed.progressGoal,
    category: previous?.category ?? "Imported Focus",
    targetDate: parsed.date,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: previous?.relatedGoalId ?? "goal-daily-001",
    relatedModuleId,
    dataSource: "mock",
    futureTableName: "daily_focus_plans",
    automationReady: true,
    subGoals: [
      parsed.learningModuleTitle,
      parsed.requiredSkills.join(", ") || "필요 기술 정리",
    ],
    firstAction: parsed.firstAction,
    completionCriteria: parsed.completionCriteria,
    expectedOutput: parsed.expectedOutput,
    mustNotMiss: parsed.remainingTasks,
    reviewNotes: previous?.reviewNotes ?? "",
    subGoalStatuses: previous?.subGoalStatuses ?? [false, false],
    firstActionDone: previous?.firstActionDone ?? false,
    completionChecked: previous?.completionChecked ?? false,
    actualOutput: previous?.actualOutput ?? "",
    mustNotMissChecked: previous?.mustNotMissChecked ?? false,
    blockedReason: previous?.blockedReason ?? "",
    nextAction: previous?.nextAction ?? "",
    selectedDate: parsed.date,
    weekKey: getWeekKey(parsed.date),
    monthKey: getMonthKey(parsed.date),
  };

  await writeUpsertedJson(file, items, item, existingIndex);
}

async function upsertLearningModule(
  parsed: ParsedAutomationImport,
  now: string,
): Promise<string> {
  const file = "learning-modules.json";
  const items = await readJsonFile<LearningModule>(file);
  const normalizedTitle = normalizeText(parsed.learningModuleTitle);
  const existingIndex = items.findIndex(
    (item) =>
      normalizeText(item.title) === normalizedTitle ||
      normalizeText(item.title).includes(normalizedTitle) ||
      normalizedTitle.includes(normalizeText(item.title)),
  );
  const previous = existingIndex >= 0 ? items[existingIndex] : undefined;
  const id = previous?.id ?? `module-import-${slugify(parsed.learningModuleTitle)}`;
  const item: LearningModule = {
    id,
    title: parsed.learningModuleTitle,
    description: `${parsed.coreGoal} 실행에 연결된 학습/실행 모듈입니다.`,
    status: "in_progress",
    progress: Math.max(previous?.progress ?? 0, parsed.progressGoal),
    category: previous?.category ?? "Imported Module",
    targetDate: parsed.date,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: previous?.relatedGoalId ?? "goal-daily-001",
    dataSource: "mock",
    futureTableName: "learning_modules",
    automationReady: true,
    currentLevel: previous?.currentLevel ?? 2,
    targetLevel: previous?.targetLevel ?? 4,
    focusToday: true,
  };

  await writeUpsertedJson(file, items, item, existingIndex);
  return id;
}

async function upsertAiApplication(
  parsed: ParsedAutomationImport,
  relatedModuleId: string,
  now: string,
) {
  const file = "ai-applications.json";
  const items = await readJsonFile<AiApplication>(file);
  const id = `ai-import-${parsed.date}`;
  const existingIndex = items.findIndex(
    (item) => item.id === id || item.targetDate === parsed.date,
  );
  const previous = existingIndex >= 0 ? items[existingIndex] : undefined;
  const item: AiApplication = {
    id: previous?.id ?? id,
    title: `AI/AX 적용: ${parsed.coreGoal}`,
    description: parsed.aiTransformedForm,
    status: "in_progress",
    progress: parsed.progressGoal,
    category: previous?.category ?? "Imported AI/AX",
    targetDate: parsed.date,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: previous?.relatedGoalId ?? "goal-daily-001",
    relatedModuleId,
    dataSource: "mock",
    futureTableName: "ai_applications",
    automationReady: true,
    businessProblem: parsed.businessProblem,
    aiSolvableForm: parsed.aiTransformedForm,
    requiredSkills:
      parsed.requiredSkills.length > 0 ? parsed.requiredSkills : ["AI 문제 재정의"],
    expectedAutomationEffect: parsed.expectedEffect,
    targetWork: parsed.coreGoal,
    relatedLearningModuleIds: Array.from(
      new Set([relatedModuleId, ...(previous?.relatedLearningModuleIds ?? [])]),
    ),
    automationScore: Math.max(30, Math.min(90, parsed.progressGoal)),
  };

  await writeUpsertedJson(file, items, item, existingIndex);
}

async function upsertEvidenceLog(
  parsed: ParsedAutomationImport,
  relatedModuleId: string,
  now: string,
) {
  const file = "evidence-logs.json";
  const items = await readJsonFile<EvidenceLog>(file);
  const id = `evidence-import-${parsed.date}`;
  const existingIndex = items.findIndex((item) => item.id === id);
  const previous = existingIndex >= 0 ? items[existingIndex] : undefined;
  const item: EvidenceLog = {
    id: previous?.id ?? id,
    title: `자동화 입력 로그 - ${parsed.date}`,
    description: parsed.sourceTitle,
    status: "done",
    progress: 100,
    category: "자동화 입력",
    targetDate: parsed.date,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: previous?.relatedGoalId ?? "goal-daily-001",
    relatedModuleId,
    dataSource: "mock",
    futureTableName: "evidence_logs",
    automationReady: true,
    outputType: "문서",
    artifactLink: "/import",
    note: `${parsed.coreGoal} 자동화 결과를 붙여넣어 JSON에 반영함`,
    obsidianCandidatePath: `LifeOS/Imports/${parsed.date}-ai-education-focus.md`,
    evidenceDate: parsed.date,
    relatedFocusId: `focus-import-${parsed.date}`,
    reviewStatus: "pending",
  };

  await writeUpsertedJson(file, items, item, existingIndex);
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(dataDir, fileName);
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text) as T[];
}

async function backupImportFiles(now: string) {
  const stamp = formatBackupStamp(now);
  const backupDir = path.join(dataDir, "backups", stamp);
  await mkdir(backupDir, { recursive: true });

  await Promise.all(
    importTargetFiles.map((fileName) =>
      copyFile(path.join(dataDir, fileName), path.join(backupDir, fileName)),
    ),
  );
}

async function appendImportLog(log: AutomationImportLog) {
  const file = "automation-import-logs.json";
  let logs: AutomationImportLog[] = [];

  try {
    logs = await readJsonFile<AutomationImportLog>(file);
  } catch {
    logs = [];
  }

  await writeFile(
    path.join(dataDir, file),
    `${JSON.stringify([log, ...logs], null, 2)}\n`,
    "utf8",
  );
}

async function writeUpsertedJson<T>(
  fileName: string,
  items: T[],
  item: T,
  existingIndex: number,
) {
  const nextItems = [...items];
  if (existingIndex >= 0) {
    nextItems[existingIndex] = item;
  } else {
    nextItems.unshift(item);
  }

  await writeFile(
    path.join(dataDir, fileName),
    `${JSON.stringify(nextItems, null, 2)}\n`,
    "utf8",
  );
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "automation-module";
}

function formatBackupStamp(isoDate: string): string {
  const date = new Date(isoDate);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}-${get("hour")}${get("minute")}`;
}
