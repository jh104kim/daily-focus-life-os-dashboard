import { readFileSync } from "node:fs";
import path from "node:path";
import { detectAutomationType } from "../lib/detect-automation-type";
import { buildJsonDiff } from "../lib/json-diff-utils";
import { parseAutomationUnified } from "../lib/parse-automation-unified";
import { parseBulkAutomationImport } from "../lib/parse-bulk-automation-import";
import { parseDailyFocusUpdate } from "../lib/parse-daily-focus-update";
import { parseDailyOperationText } from "../lib/parse-daily-operation-text";
import { splitAutomationBulkText } from "../lib/split-automation-bulk-text";
import type {
  AutomationBlock,
  AutomationImportPreview,
  AutomationType,
  DailyFocusPlan,
  JsonFileDiff,
} from "../lib/types";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures");

const expectedTypes: Array<[string, AutomationType]> = [
  ["oflow-morning-brief.txt", "oflow_morning_brief"],
  ["ai-education-focus.txt", "ai_education_focus"],
  ["evening-reflection.txt", "evening_reflection"],
  ["daily-focus-ab-test.txt", "daily_focus_ab_test"],
  ["ai-framework-check.txt", "ai_framework_check"],
  ["reminder-task.txt", "reminder_task"],
  ["daily-focus-update.txt", "daily_focus_update"],
  ["daily-operation-log.txt", "daily_operation_log"],
  ["unknown.txt", "unknown"],
];

const existingFocus: DailyFocusPlan = {
  id: "focus-existing-2026-06-15",
  title: "기존 Daily Focus",
  description: "기존 목표",
  status: "in_progress",
  progress: 40,
  category: "Daily Focus",
  targetDate: "2026-06-15",
  createdAt: "2026-06-15T00:00:00+09:00",
  updatedAt: "2026-06-15T00:00:00+09:00",
  relatedGoalId: "goal-daily-001",
  dataSource: "mock",
  futureTableName: "daily_focus_plans",
  automationReady: true,
  subGoals: ["기존 서브 목표 1", "기존 서브 목표 2"],
  firstAction: "기존 첫 행동",
  completionCriteria: "기존 완료 기준",
  expectedOutput: "기존 산출물",
  mustNotMiss: "기존 주의 사항",
  selectedDate: "2026-06-15",
};

function main() {
  testDetectAutomationType();
  testSplitAutomationBulkText();
  testParseAutomationUnified();
  testParseDailyFocusUpdate();
  testParseDailyOperationText();
  testParseBulkAutomationImport();
  testFullAutomationInputsFixture();
  console.log("parser fixture tests passed");
}

function testDetectAutomationType() {
  for (const [fileName, expected] of expectedTypes) {
    assertEqual(detectAutomationType(fixture(fileName)), expected, `${fileName} type`);
  }
}

function testSplitAutomationBulkText() {
  const blocks = splitAutomationBulkText(
    fixture("bulk-mixed-automation.txt"),
    "fixture-batch",
    "2026-06-15",
  );
  assertEqual(blocks.length, 9, "bulk block count");
  assertEqual(blocks.filter((block) => block.automationType === "unknown").length, 1, "unknown block count");
  assert(blocks.every((block) => block.targetDate === "2026-06-15"), "all block targetDate");
}

function testParseAutomationUnified() {
  for (const [fileName, expected] of expectedTypes.filter(
    ([, type]) => !["daily_focus_update", "daily_operation_log", "unknown"].includes(type),
  )) {
    const preview = parseAutomationUnified(fixture(fileName), {
      selectedDate: "2026-06-15",
      dailyFocusPlans: [existingFocus],
    });
    assertEqual(preview.automationType, expected, `${fileName} unified type`);
    assertEqual(preview.targetDate, "2026-06-15", `${fileName} targetDate`);
    assert(preview.targetFiles.length > 0, `${fileName} target files`);
  }

  const unknown = parseAutomationUnified(fixture("unknown.txt"), { selectedDate: "2026-06-15" });
  assertEqual(unknown.automationType, "unknown", "unknown unified type");
  assertEqual(unknown.targetFiles.length, 0, "unknown target files");
}

function testParseDailyFocusUpdate() {
  const block = blockFromFixture("daily-focus-update.txt", "daily_focus_update");
  const preview = parseDailyFocusUpdate(block, { dailyFocusPlans: [existingFocus] });
  assertEqual(preview.targetFiles[0], "data/daily-focus-plans.json", "daily focus update target");
  assertEqual(preview.dailyFocusPlan?.progress, 82, "daily focus update progress");
  assertEqual(preview.dailyFocusPlan?.firstActionDone, true, "daily focus first action done");
}

function testParseDailyOperationText() {
  const parsed = parseDailyOperationText({
    pastedText: fixture("daily-operation-log.txt"),
    selectedDate: "2026-06-15",
    focus: existingFocus,
  });
  assertEqual(parsed.selectedDate, "2026-06-15", "daily operation date");
  assert(parsed.reflection.completed.length > 0, "daily operation reflection");
  assert(parsed.evidenceLogs.length > 0, "daily operation evidence");
}

function testParseBulkAutomationImport() {
  const parsed = parseBulkAutomationImport({
    pastedText: fixture("bulk-mixed-automation.txt"),
    selectedDate: "2026-06-15",
    importBatchId: "fixture-batch",
    context: {
      selectedDate: "2026-06-15",
      dailyFocusPlans: [existingFocus],
      learningModules: [],
      aiApplications: [],
      reflections: [],
      evidenceLogs: [],
      briefLogs: [],
      abTestLogs: [],
      aiFrameworkChecks: [],
      reminderTasks: [],
    },
    buildDiff: buildFixtureDiff,
  });

  assertEqual(parsed.detectedBlockCount, 9, "bulk detected block count");
  assertEqual(parsed.parsedBlockCount, 8, "bulk parsed block count");
  assertEqual(parsed.unknownBlockCount, 1, "bulk unknown block count");
  assert(parsed.targetFiles.includes("data/daily-focus-plans.json"), "bulk target daily focus");
  assert(parsed.targetFiles.includes("data/reflections.json"), "bulk target reflections");
  assert(parsed.diff.length > 0, "bulk diff generated");
}

function testFullAutomationInputsFixture() {
  const parsed = parseBulkAutomationImport({
    pastedText: fixture("automation-inputs-full.md"),
    selectedDate: "2026-06-12",
    importBatchId: "full-fixture-batch",
    context: {
      selectedDate: "2026-06-12",
      dailyFocusPlans: [existingFocus],
      learningModules: [],
      aiApplications: [],
      reflections: [],
      evidenceLogs: [],
      briefLogs: [],
      abTestLogs: [],
      aiFrameworkChecks: [],
      reminderTasks: [],
    },
    buildDiff: buildFixtureDiff,
  });

  assertEqual(parsed.detectedBlockCount, 12, "full automation fixture block count");
  assertEqual(parsed.parsedBlockCount, 9, "full automation fixture parsed count");
  assertEqual(parsed.unknownBlockCount, 3, "full automation fixture unknown count");
  assert(
    parsed.blocks.every((block) => !/^Oflow Morning Brief - YYYY-MM-DD$/.test(block.sourceTitle)),
    "fenced markdown headings are not split into blocks",
  );
}

function buildFixtureDiff(previews: AutomationImportPreview[]): JsonFileDiff[] {
  const dailyFocusAfter = previews
    .map((preview) => preview.dailyFocusPlan)
    .filter((item): item is DailyFocusPlan => Boolean(item));
  const reflectionAfter = previews
    .filter((preview) => preview.reflection)
    .map((preview) => ({
      id: preview.reflection?.id ?? `reflection-${preview.targetDate}`,
      title: preview.reflection?.completed[0] ?? `저녁 회고 - ${preview.targetDate}`,
      targetDate: preview.targetDate,
      completed: preview.reflection?.completed ?? [],
      tomorrowFirstAction: preview.reflection?.tomorrowFirstAction ?? "",
    }));

  return [
    buildJsonDiff(
      "daily-focus-plans.json",
      [existingFocus as unknown as Record<string, unknown>],
      dailyFocusAfter.map((item) => item as unknown as Record<string, unknown>),
      ["selectedDate", "targetDate", "id"],
    ),
    buildJsonDiff("reflections.json", [], reflectionAfter, ["targetDate", "id"]),
  ].filter((diff) => diff.added.length || diff.updated.length || diff.removed.length);
}

function blockFromFixture(fileName: string, automationType: AutomationType): AutomationBlock {
  return {
    importBlockId: `fixture-${fileName}`,
    rawText: fixture(fileName),
    automationType,
    targetDate: "2026-06-15",
    sourceTitle: fileName,
  };
}

function fixture(fileName: string): string {
  return readFileSync(path.join(fixtureDir, fileName), "utf8");
}

function assert(value: unknown, message: string): asserts value {
  if (!value) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}. expected ${String(expected)}, got ${String(actual)}`,
    );
  }
}

main();
