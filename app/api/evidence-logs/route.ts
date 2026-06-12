import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDateKey } from "@/lib/dashboard-utils";
import type { EvidenceLog, EvidenceLogCreateInput, EvidenceType } from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const evidenceFile = "evidence-logs.json";
const evidenceTypes: EvidenceType[] = ["문서", "코드", "대시보드", "회고"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EvidenceLogCreateInput;
    const selectedDate = getDateKey(body.selectedDate);

    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, message: "산출물명이 필요합니다." },
        { status: 400 },
      );
    }

    if (!evidenceTypes.includes(body.outputType)) {
      return NextResponse.json(
        { success: false, message: "outputType 값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const items = await readJsonFile<EvidenceLog>(evidenceFile);
    await backupFile(evidenceFile);

    const now = new Date().toISOString();
    const sourceUrl = body.sourceUrl?.trim() || `/evidence#${selectedDate}`;
    const item: EvidenceLog = {
      id: `evidence-${selectedDate}-${Date.now()}`,
      title: body.title.trim(),
      description: body.note.trim() || `${selectedDate} 산출물 로그`,
      status: "done",
      progress: 100,
      category: body.evidenceType?.trim() || body.outputType,
      targetDate: selectedDate,
      createdAt: now,
      updatedAt: now,
      relatedGoalId: body.relatedGoalId || undefined,
      relatedModuleId: body.relatedModuleId || undefined,
      dataSource: "mock",
      futureTableName: "evidence_logs",
      automationReady: true,
      outputType: body.outputType,
      evidenceType: body.evidenceType?.trim() || body.outputType,
      artifactLink: sourceUrl,
      sourceUrl,
      note: body.note,
      obsidianCandidatePath: `LifeOS/Evidence/${selectedDate}-${slugify(body.title)}.md`,
      evidenceDate: selectedDate,
      relatedFocusId: body.relatedFocusId || undefined,
      reviewStatus: "pending",
    };

    items.unshift(item);
    await writeFile(
      path.join(dataDir, evidenceFile),
      `${JSON.stringify(items, null, 2)}\n`,
      "utf8",
    );

    for (const route of ["/", "/evidence"]) {
      revalidatePath(route);
    }

    return NextResponse.json({ success: true, item, message: "산출물 로그 저장 완료" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "산출물 로그 저장 실패";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const text = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(text) as T[];
}

async function backupFile(fileName: string) {
  const stamp = formatBackupStamp(new Date());
  const backupDir = path.join(dataDir, "backups", stamp);
  await mkdir(backupDir, { recursive: true });
  await copyFile(path.join(dataDir, fileName), path.join(backupDir, fileName));
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
