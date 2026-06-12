import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDateKey } from "@/lib/dashboard-utils";
import type { Reflection, ReflectionUpsertInput } from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const reflectionsFile = "reflections.json";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReflectionUpsertInput;
    const selectedDate = getDateKey(body.selectedDate);

    if (!selectedDate) {
      return NextResponse.json(
        { success: false, message: "selectedDate가 필요합니다." },
        { status: 400 },
      );
    }

    const items = await readJsonFile<Reflection>(reflectionsFile);
    const index = items.findIndex(
      (item) =>
        item.id === body.id ||
        getDateKey(item.reflectionDate ?? item.targetDate) === selectedDate,
    );

    await backupFile(reflectionsFile);

    const now = new Date().toISOString();
    const current = index >= 0 ? items[index] : undefined;
    const title =
      body.completed.find((item) => item.trim()) ||
      current?.title ||
      `저녁 회고 - ${selectedDate}`;

    const next: Reflection = {
      id: current?.id ?? `reflection-${selectedDate}`,
      title,
      description: body.misses.find((item) => item.trim()) || "선택 날짜 저녁 회고",
      status: "done",
      progress: 100,
      category: current?.category ?? "Daily Reflection",
      targetDate: selectedDate,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
      relatedGoalId: body.relatedGoalId ?? current?.relatedGoalId,
      relatedModuleId: body.relatedModuleId ?? current?.relatedModuleId,
      dataSource: "mock",
      futureTableName: "reflections",
      automationReady: true,
      completed: body.completed,
      misses: body.misses,
      tomorrowFirstAction: body.tomorrowFirstAction,
      tomorrowGoalDraft: body.tomorrowGoalDraft,
      learnings: body.learnings,
      applicationPoints: body.applicationPoints,
      autoFillCandidates: [
        "tomorrowFirstAction",
        "tomorrowGoalDraft",
        "appliedToWork",
      ],
      relatedFocusId: body.relatedFocusId ?? current?.relatedFocusId,
      reflectionDate: selectedDate,
      appliedToWork: body.applicationPoints,
    };

    if (index >= 0) {
      items[index] = next;
    } else {
      items.unshift(next);
    }

    await writeFile(
      path.join(dataDir, reflectionsFile),
      `${JSON.stringify(items, null, 2)}\n`,
      "utf8",
    );

    for (const route of ["/", "/reflection"]) {
      revalidatePath(route);
    }

    return NextResponse.json({ success: true, item: next, message: "회고 저장 완료" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회고 저장 실패";
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
