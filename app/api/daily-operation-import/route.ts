import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDailyFocusByDate, getDateKey, getReflectionByDate } from "@/lib/dashboard-utils";
import { parseDailyOperationText } from "@/lib/parse-daily-operation-text";
import type {
  DailyFocusPlan,
  EvidenceLog,
  ParsedDailyOperationImport,
  Reflection,
} from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const dailyFocusFile = "daily-focus-plans.json";
const reflectionsFile = "reflections.json";
const evidenceFile = "evidence-logs.json";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pastedText?: string;
      selectedDate?: string;
      dryRun?: boolean;
    };
    const pastedText = body.pastedText?.trim() ?? "";
    const selectedDate = getDateKey(body.selectedDate ?? new Date());

    if (!pastedText) {
      return NextResponse.json(
        { success: false, message: "붙여넣은 텍스트가 필요합니다." },
        { status: 400 },
      );
    }

    const [dailyFocusPlans, reflections] = await Promise.all([
      readJsonFile<DailyFocusPlan>(dailyFocusFile),
      readJsonFile<Reflection>(reflectionsFile),
    ]);
    const focus = getDailyFocusByDate(selectedDate, dailyFocusPlans);
    const existingReflection = getReflectionByDate(selectedDate, reflections);
    const parsed = parseDailyOperationText({
      pastedText,
      selectedDate,
      focus,
      existingReflection,
    });

    if (body.dryRun) {
      return NextResponse.json({
        success: true,
        parsed,
        updatedFiles: [],
        message: "분류 미리보기 완료",
      });
    }

    await backupFiles([reflectionsFile, evidenceFile]);

    const nextReflection = upsertReflection(reflections, parsed);
    await writeFile(
      path.join(dataDir, reflectionsFile),
      `${JSON.stringify(reflections, null, 2)}\n`,
      "utf8",
    );

    const evidenceLogs = await readJsonFile<EvidenceLog>(evidenceFile);
    const savedEvidence = upsertEvidenceLogs(evidenceLogs, parsed);
    await writeFile(
      path.join(dataDir, evidenceFile),
      `${JSON.stringify(evidenceLogs, null, 2)}\n`,
      "utf8",
    );

    for (const route of ["/", "/reflection", "/evidence"]) {
      revalidatePath(route);
    }

    return NextResponse.json({
      success: true,
      parsed,
      item: {
        reflection: nextReflection,
        evidenceLogs: savedEvidence,
      },
      updatedFiles: [`data/${reflectionsFile}`, `data/${evidenceFile}`],
      message: "운영 기록 저장 완료",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "운영 기록 저장 실패";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

function upsertReflection(
  reflections: Reflection[],
  parsed: ParsedDailyOperationImport,
): Reflection {
  const now = new Date().toISOString();
  const index = reflections.findIndex(
    (item) =>
      item.id === parsed.reflection.id ||
      getDateKey(item.reflectionDate ?? item.targetDate) === parsed.selectedDate,
  );
  const current = index >= 0 ? reflections[index] : undefined;
  const next: Reflection = {
    id: current?.id ?? `reflection-${parsed.selectedDate}`,
    title:
      parsed.reflection.completed.find(Boolean) ??
      current?.title ??
      `저녁 회고 - ${parsed.selectedDate}`,
    description:
      parsed.reflection.misses.find(Boolean) ??
      current?.description ??
      "붙여넣은 운영 기록에서 분류된 저녁 회고",
    status: "done",
    progress: 100,
    category: current?.category ?? "Daily Reflection",
    targetDate: parsed.selectedDate,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    relatedGoalId: parsed.reflection.relatedGoalId ?? current?.relatedGoalId,
    relatedModuleId: parsed.reflection.relatedModuleId ?? current?.relatedModuleId,
    dataSource: "mock",
    futureTableName: "reflections",
    automationReady: true,
    completed: parsed.reflection.completed,
    misses: parsed.reflection.misses,
    tomorrowFirstAction: parsed.reflection.tomorrowFirstAction,
    tomorrowGoalDraft: parsed.reflection.tomorrowGoalDraft,
    learnings: parsed.reflection.learnings,
    applicationPoints: parsed.reflection.applicationPoints,
    autoFillCandidates: ["tomorrowFirstAction", "tomorrowGoalDraft", "appliedToWork"],
    relatedFocusId: parsed.reflection.relatedFocusId ?? current?.relatedFocusId,
    reflectionDate: parsed.selectedDate,
    appliedToWork: parsed.reflection.applicationPoints,
  };

  if (index >= 0) {
    reflections[index] = next;
  } else {
    reflections.unshift(next);
  }

  return next;
}

function upsertEvidenceLogs(
  evidenceLogs: EvidenceLog[],
  parsed: ParsedDailyOperationImport,
): EvidenceLog[] {
  const now = new Date().toISOString();
  return parsed.evidenceLogs.map((input, inputIndex) => {
    const index = evidenceLogs.findIndex(
      (item) =>
        getDateKey(item.evidenceDate ?? item.targetDate) === parsed.selectedDate &&
        item.title.trim() === input.title.trim(),
    );
    const current = index >= 0 ? evidenceLogs[index] : undefined;
    const sourceUrl = input.sourceUrl?.trim() || current?.sourceUrl || current?.artifactLink || "/";
    const next: EvidenceLog = {
      id: current?.id ?? `evidence-${parsed.selectedDate}-${Date.now()}-${inputIndex + 1}`,
      title: input.title.trim(),
      description: input.note.trim() || current?.description || `${parsed.selectedDate} 산출물 로그`,
      status: "done",
      progress: 100,
      category: input.evidenceType?.trim() || input.outputType,
      targetDate: parsed.selectedDate,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
      relatedGoalId: input.relatedGoalId || current?.relatedGoalId,
      relatedModuleId: input.relatedModuleId || current?.relatedModuleId,
      dataSource: "mock",
      futureTableName: "evidence_logs",
      automationReady: true,
      outputType: input.outputType,
      evidenceType: input.evidenceType?.trim() || input.outputType,
      artifactLink: sourceUrl,
      sourceUrl,
      note: input.note,
      obsidianCandidatePath:
        current?.obsidianCandidatePath ??
        `LifeOS/Evidence/${parsed.selectedDate}-${slugify(input.title)}.md`,
      evidenceDate: parsed.selectedDate,
      relatedFocusId: input.relatedFocusId || current?.relatedFocusId,
      reviewStatus: current?.reviewStatus ?? "pending",
    };

    if (index >= 0) {
      evidenceLogs[index] = next;
    } else {
      evidenceLogs.unshift(next);
    }

    return next;
  });
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const text = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(text) as T[];
}

async function backupFiles(fileNames: string[]) {
  const stamp = formatBackupStamp(new Date());
  const backupDir = path.join(dataDir, "backups", stamp);
  await mkdir(backupDir, { recursive: true });
  await Promise.all(
    fileNames.map((fileName) =>
      copyFile(path.join(dataDir, fileName), path.join(backupDir, fileName)),
    ),
  );
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatBackupStamp(date: Date): string {
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
