import aiApplicationsJson from "../data/ai-applications.json";
import automationRoadmapJson from "../data/automation-roadmap.json";
import dailyFocusPlansJson from "../data/daily-focus-plans.json";
import dataSourceStatusJson from "../data/data-source-status.json";
import evidenceLogsJson from "../data/evidence-logs.json";
import goalsJson from "../data/goals.json";
import learningModulesJson from "../data/learning-modules.json";
import reflectionsJson from "../data/reflections.json";
import type {
  AiApplication,
  AutomationRoadmapItem,
  DailyFocusPlan,
  DataSourceStatus,
  EvidenceLog,
  Goal,
  LearningModule,
  Reflection,
} from "./types";

export const dailyFocusPlans = dailyFocusPlansJson as unknown as DailyFocusPlan[];
export const goals = goalsJson as unknown as Goal[];
export const aiApplications = aiApplicationsJson as unknown as AiApplication[];
export const learningModules = learningModulesJson as unknown as LearningModule[];
export const reflections = reflectionsJson as unknown as Reflection[];
export const evidenceLogs = evidenceLogsJson as unknown as EvidenceLog[];
export const automationRoadmap =
  automationRoadmapJson as unknown as AutomationRoadmapItem[];
export const dataSourceStatus =
  dataSourceStatusJson as unknown as DataSourceStatus[];
