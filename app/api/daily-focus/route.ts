import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getMonthKey, getWeekKey } from "@/lib/dashboard-utils";
import type { DailyFocusPlan, DailyFocusReviewUpdate } from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const dailyFocusFile = "daily-focus-plans.json";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as DailyFocusReviewUpdate;

    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Daily Focus id가 필요합니다." },
        { status: 400 },
      );
    }

    const items = await readJsonFile<DailyFocusPlan>(dailyFocusFile);
    const index = items.findIndex((item) => item.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Daily Focus 항목을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    await backupDailyFocusFile();

    const current = items[index];
    const next: DailyFocusPlan = {
      ...current,
      reviewNotes: body.reviewNotes ?? current.reviewNotes ?? "",
      subGoalStatuses: body.subGoalStatuses ?? current.subGoalStatuses ?? [false, false],
      firstActionDone: body.firstActionDone ?? current.firstActionDone ?? false,
      completionChecked: body.completionChecked ?? current.completionChecked ?? false,
      actualOutput: body.actualOutput ?? current.actualOutput ?? "",
      mustNotMissChecked:
        body.mustNotMissChecked ?? current.mustNotMissChecked ?? false,
      progress:
        typeof body.progress === "number"
          ? Math.max(0, Math.min(100, body.progress))
          : current.progress,
      status: body.status ?? current.status,
      blockedReason: body.blockedReason ?? current.blockedReason ?? "",
      nextAction: body.nextAction ?? current.nextAction ?? "",
      selectedDate: current.selectedDate ?? current.targetDate,
      weekKey: current.weekKey ?? getWeekKey(current.targetDate),
      monthKey: current.monthKey ?? getMonthKey(current.targetDate),
      updatedAt: new Date().toISOString(),
    };

    items[index] = next;
    await writeFile(
      path.join(dataDir, dailyFocusFile),
      `${JSON.stringify(items, null, 2)}\n`,
      "utf8",
    );

    for (const route of ["/", "/focus"]) {
      revalidatePath(route);
    }

    return NextResponse.json({ success: true, item: next, message: "저장 완료" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장 실패";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const text = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(text) as T[];
}

async function backupDailyFocusFile() {
  const stamp = formatBackupStamp(new Date());
  const backupDir = path.join(dataDir, "backups", stamp);
  await mkdir(backupDir, { recursive: true });
  await copyFile(path.join(dataDir, dailyFocusFile), path.join(backupDir, dailyFocusFile));
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
