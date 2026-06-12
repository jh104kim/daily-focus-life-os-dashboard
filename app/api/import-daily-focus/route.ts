import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseAutomationText } from "@/lib/parse-automation-text";
import type {
  AiApplication,
  DailyFocusPlan,
  EvidenceLog,
  ImportDailyFocusResponse,
  LearningModule,
  ParsedAutomationImport,
} from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pastedText?: string };
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

    const parsed = parseAutomationText(pastedText);
    const updatedFiles = await persistParsedImport(parsed);

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
  };

  await writeUpsertedJson(file, items, item, existingIndex);
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(dataDir, fileName);
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text) as T[];
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
