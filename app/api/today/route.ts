import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type {
  ABTestLog,
  AIFrameworkCheck,
  AiApplication,
  BriefLog,
  DailyFocusPlan,
  DashboardData,
  EvidenceLog,
  Goal,
  InvestmentReportLog,
  InvestmentSummaryLog,
  LearningModule,
  ReminderTask,
  Reflection,
  WeeklyNewsSummaryLog,
} from "@/lib/types";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");

export async function GET() {
  const data: DashboardData = {
    dailyFocusPlans: await readJsonFile<DailyFocusPlan>("daily-focus-plans.json"),
    goals: await readJsonFile<Goal>("goals.json"),
    aiApplications: await readJsonFile<AiApplication>("ai-applications.json"),
    learningModules: await readJsonFile<LearningModule>("learning-modules.json"),
    reflections: await readJsonFile<Reflection>("reflections.json"),
    evidenceLogs: await readJsonFile<EvidenceLog>("evidence-logs.json"),
    briefLogs: await readJsonFile<BriefLog>("brief-logs.json"),
    abTestLogs: await readJsonFile<ABTestLog>("ab-test-logs.json"),
    aiFrameworkChecks: await readJsonFile<AIFrameworkCheck>("ai-framework-checks.json"),
    reminderTasks: await readJsonFile<ReminderTask>("reminder-tasks.json"),
    weeklyNewsSummaries: await readJsonFile<WeeklyNewsSummaryLog>(
      "news-summary-logs.json",
    ),
    investmentReportLogs: await readJsonFile<InvestmentReportLog>(
      "investment-report-logs.json",
    ),
    investmentSummaryLogs: await readJsonFile<InvestmentSummaryLog>(
      "investment-summary-logs.json",
    ),
  };

  return NextResponse.json(data);
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const text = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(text) as T[];
}
