import aiApplicationsJson from "../data/ai-applications.json";
import abTestLogsJson from "../data/ab-test-logs.json";
import aiFrameworkChecksJson from "../data/ai-framework-checks.json";
import automationRoadmapJson from "../data/automation-roadmap.json";
import briefLogsJson from "../data/brief-logs.json";
import dailyFocusPlansJson from "../data/daily-focus-plans.json";
import dataSourceStatusJson from "../data/data-source-status.json";
import evidenceLogsJson from "../data/evidence-logs.json";
import goalsJson from "../data/goals.json";
import investmentReportLogsJson from "../data/investment-report-logs.json";
import investmentSummaryLogsJson from "../data/investment-summary-logs.json";
import learningModulesJson from "../data/learning-modules.json";
import newsSummaryLogsJson from "../data/news-summary-logs.json";
import reminderTasksJson from "../data/reminder-tasks.json";
import reflectionsJson from "../data/reflections.json";
import type {
  ABTestLog,
  AIFrameworkCheck,
  AiApplication,
  AutomationRoadmapItem,
  BriefLog,
  DailyFocusPlan,
  DataSourceStatus,
  EvidenceLog,
  Goal,
  InvestmentReportLog,
  InvestmentSummaryLog,
  LearningModule,
  ReminderTask,
  Reflection,
  WeeklyNewsSummaryLog,
} from "./types";

export const dailyFocusPlans = dailyFocusPlansJson as unknown as DailyFocusPlan[];
export const goals = goalsJson as unknown as Goal[];
export const aiApplications = aiApplicationsJson as unknown as AiApplication[];
export const learningModules = learningModulesJson as unknown as LearningModule[];
export const reflections = reflectionsJson as unknown as Reflection[];
export const evidenceLogs = evidenceLogsJson as unknown as EvidenceLog[];
export const briefLogs = briefLogsJson as unknown as BriefLog[];
export const abTestLogs = abTestLogsJson as unknown as ABTestLog[];
export const aiFrameworkChecks =
  aiFrameworkChecksJson as unknown as AIFrameworkCheck[];
export const reminderTasks = reminderTasksJson as unknown as ReminderTask[];
export const weeklyNewsSummaries =
  newsSummaryLogsJson as unknown as WeeklyNewsSummaryLog[];
export const investmentReportLogs =
  investmentReportLogsJson as unknown as InvestmentReportLog[];
export const investmentSummaryLogs =
  investmentSummaryLogsJson as unknown as InvestmentSummaryLog[];
export const automationRoadmap =
  automationRoadmapJson as unknown as AutomationRoadmapItem[];
export const dataSourceStatus =
  dataSourceStatusJson as unknown as DataSourceStatus[];
