import {
  mergeHintTargetFiles,
  parseDashboardImportHint,
} from "./dashboard-import-hint";
import { detectAutomationType } from "./detect-automation-type";
import { getMonthKey, getWeekKey } from "./dashboard-utils";
import { parseAutomationText } from "./parse-automation-text";
import { parseDailyOperationText } from "./parse-daily-operation-text";
import type {
  ABTestLog,
  AIFrameworkCheck,
  AiApplication,
  AutomationImportPreview,
  AutomationType,
  BriefLog,
  DailyFocusPlan,
  EvidenceLog,
  EvidenceLogCreateInput,
  InvestmentReportLog,
  InvestmentSummaryLog,
  LearningModule,
  Reflection,
  ReminderTask,
  WeeklyNewsSummaryLog,
} from "./types";

export interface AutomationParseContext {
  selectedDate?: string;
  dailyFocusPlans?: DailyFocusPlan[];
  learningModules?: LearningModule[];
  aiApplications?: AiApplication[];
  reflections?: Reflection[];
  evidenceLogs?: EvidenceLog[];
  briefLogs?: BriefLog[];
  abTestLogs?: ABTestLog[];
  aiFrameworkChecks?: AIFrameworkCheck[];
  reminderTasks?: ReminderTask[];
  weeklyNewsSummaries?: WeeklyNewsSummaryLog[];
  investmentReportLogs?: InvestmentReportLog[];
  investmentSummaryLogs?: InvestmentSummaryLog[];
}

export function parseAutomationUnified(
  text: string,
  context: AutomationParseContext = {},
): AutomationImportPreview {
  const hint = parseDashboardImportHint(text);
  const automationType = detectAutomationType(text);
  const targetDate = hint.targetDate || extractDate(text) || context.selectedDate || getTodayDate();
  const sourceTitle = getSourceTitle(text, automationType, targetDate);
  const base = createBase(targetDate);

  if (automationType === "oflow_morning_brief") {
    return applyDashboardImportHint(parseOflowMorningBrief(text, base, sourceTitle, context), hint);
  }

  if (automationType === "ai_education_focus") {
    return applyDashboardImportHint(parseAiEducationFocus(text, base, sourceTitle, context), hint);
  }

  if (automationType === "evening_reflection") {
    return applyDashboardImportHint(parseEveningReflection(text, base, sourceTitle, context), hint);
  }

  if (automationType === "daily_focus_ab_test") {
    return applyDashboardImportHint(parseAbTest(text, base, sourceTitle, context), hint);
  }

  if (automationType === "ai_framework_check") {
    return applyDashboardImportHint(parseFrameworkCheck(text, base, sourceTitle, context), hint);
  }

  if (automationType === "reminder_task") {
    return applyDashboardImportHint(parseReminderTask(text, base, sourceTitle, context), hint);
  }

  if (automationType === "weekly_news_summary") {
    return applyDashboardImportHint(parseWeeklyNewsSummary(text, base, sourceTitle, context), hint);
  }

  if (automationType === "weekly_etf_report_check") {
    return applyDashboardImportHint(parseWeeklyEtfReportCheck(text, base, sourceTitle, context), hint);
  }

  if (automationType === "weekly_investment_summary") {
    return applyDashboardImportHint(parseWeeklyInvestmentSummary(text, base, sourceTitle, context), hint);
  }

  return applyDashboardImportHint({
    automationType: "unknown",
    targetDate,
    sourceTitle,
    targetFiles: [],
    evidenceLogs: [],
    missingFields: ["automationType"],
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${targetDate}`],
    warnings: ["자동화 유형을 판별하지 못해 저장하지 않습니다."],
    overwrite: {},
  }, hint);
}

function parseOflowMorningBrief(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const coreGoal = firstLine(section(text, ["오늘의 핵심 목표", "핵심 목표"]));
  const subGoals = lines(section(text, ["서브 목표", "서브목표"]));
  const firstAction = firstLine(section(text, ["오늘 첫 행동", "오늘의 첫 행동"]));
  const mustNotMiss = firstLine(section(text, ["오늘 놓치면 안 되는 것", "놓치면 안 되는 것"]));
  const dailyFocusPlan = buildDailyFocus({
    base,
    id: `focus-oflow-${base.date}`,
    title: coreGoal || "Oflow Morning Brief 핵심 목표",
    description: mustNotMiss || "Oflow Morning Brief에서 생성된 오늘 운영 계획",
    progress: 30,
    subGoals: [subGoals[0] || "오늘 일정 확인", subGoals[1] || "핵심 커뮤니케이션 확인"],
    firstAction: firstAction || "오늘 일정과 커뮤니케이션 우선순위를 확인한다.",
    completionCriteria: "오늘 우선순위와 놓치면 안 되는 항목을 확인함",
    expectedOutput: "Oflow Morning Brief 운영 로그",
    mustNotMiss: mustNotMiss || "우선순위 판단 누락 방지",
  });
  const briefLog: BriefLog = {
    ...base.entity,
    id: `brief-${base.date}`,
    title: `Oflow Morning Brief - ${base.date}`,
    description: sourceTitle,
    category: "Oflow Morning Brief",
    futureTableName: "brief_logs",
    briefDate: base.date,
    calendarSummary: firstLine(section(text, ["오늘 일정 요약"])),
    gmailSummary: firstLine(section(text, ["Gmail 핵심 요약", "Gmail 요약"])),
    slackSummary: firstLine(section(text, ["Slack 확인 필요 항목", "Slack 요약"])),
    automationStatus: firstLine(section(text, ["자동화 상태"])),
    priorityDecision: firstLine(section(text, ["우선순위 판단"])),
  };

  return withCommon({
    automationType: "oflow_morning_brief",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/daily-focus-plans.json", "data/evidence-logs.json", "data/brief-logs.json"],
    dailyFocusPlan,
    briefLog,
    evidenceLogs: [automationEvidence(base.date, sourceTitle, "Oflow Morning Brief 저장 로그", dailyFocusPlan.id)],
    missingFields: [
      coreGoal ? "" : "오늘의 핵심 목표",
      firstAction ? "" : "오늘 첫 행동",
    ].filter(Boolean),
    autoFilledFields: [
      extractDate(text) ? "" : `targetDate: ${base.date}`,
      subGoals.length >= 2 ? "" : "subGoals",
    ].filter(Boolean),
    overwrite: {
      dailyFocusPlan: existsByDate(context.dailyFocusPlans, base.date),
      briefLog: existsByDate(context.briefLogs, base.date, "briefDate"),
    },
  });
}

function parseAiEducationFocus(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const parsed = parseAutomationText(text);
  const moduleId = `module-import-${slugify(parsed.learningModuleTitle)}`;
  const dailyFocusPlan = buildDailyFocus({
    base,
    id: `focus-import-${parsed.date}`,
    title: parsed.coreGoal,
    description: parsed.remainingTasks,
    progress: parsed.progressGoal,
    relatedModuleId: moduleId,
    subGoals: [parsed.learningModuleTitle, parsed.requiredSkills.join(", ") || "필요 기술 정리"],
    firstAction: parsed.firstAction,
    completionCriteria: parsed.completionCriteria,
    expectedOutput: parsed.expectedOutput,
    mustNotMiss: parsed.remainingTasks,
  });
  const learningModule: LearningModule = {
    ...base.entity,
    id: moduleId,
    title: parsed.learningModuleTitle,
    description: `${parsed.coreGoal} 실행에 연결된 학습/실행 모듈입니다.`,
    category: "Imported Module",
    futureTableName: "learning_modules",
    currentLevel: 2,
    targetLevel: 4,
    focusToday: true,
    progress: parsed.progressGoal,
  };
  const aiApplication: AiApplication = {
    ...base.entity,
    id: `ai-import-${parsed.date}`,
    title: `AI/AX 적용: ${parsed.coreGoal}`,
    description: parsed.aiTransformedForm,
    category: "Imported AI/AX",
    futureTableName: "ai_applications",
    relatedModuleId: moduleId,
    progress: parsed.progressGoal,
    businessProblem: parsed.businessProblem,
    workProblem: parsed.businessProblem,
    aiSolvableForm: parsed.aiTransformedForm,
    aiTransformedForm: parsed.aiTransformedForm,
    requiredSkills: parsed.requiredSkills,
    expectedAutomationEffect: parsed.expectedEffect,
    expectedEffect: parsed.expectedEffect,
    targetWork: parsed.coreGoal,
    relatedLearningModuleIds: [moduleId],
    automationScore: Math.max(30, Math.min(90, parsed.progressGoal)),
  };
  const prompt = section(text, ["Codex/Claude Code 입력용 /goal 프롬프트", "/goal 프롬프트"]);
  const evidenceLogs = [
    automationEvidence(parsed.date, parsed.sourceTitle, `${parsed.coreGoal} 자동화 결과를 JSON에 반영함`, dailyFocusPlan.id, moduleId),
  ];
  if (prompt) {
    evidenceLogs.push({
      selectedDate: parsed.date,
      title: `자동화 프롬프트 - ${parsed.date}`,
      outputType: "코드",
      evidenceType: "automation_prompt",
      note: prompt,
      sourceUrl: "/import",
      relatedFocusId: dailyFocusPlan.id,
      relatedModuleId: moduleId,
    });
  }

  return withCommon({
    automationType: "ai_education_focus",
    targetDate: parsed.date,
    sourceTitle,
    targetFiles: [
      "data/daily-focus-plans.json",
      "data/learning-modules.json",
      "data/ai-applications.json",
      "data/evidence-logs.json",
    ],
    dailyFocusPlan,
    learningModule,
    aiApplication,
    evidenceLogs,
    missingFields: parsed.missingFields,
    autoFilledFields: parsed.autoFilledFields,
    overwrite: {
      dailyFocusPlan: existsByDate(context.dailyFocusPlans, parsed.date),
      learningModule: Boolean(context.learningModules?.some((item) => normalize(item.title) === normalize(parsed.learningModuleTitle))),
      aiApplication: existsByDate(context.aiApplications, parsed.date),
    },
  });
}

function parseEveningReflection(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const focus = findDailyFocus(context.dailyFocusPlans, base.date);
  const existingReflection = findReflection(context.reflections, base.date);
  const operation = parseDailyOperationText({
    pastedText: text,
    selectedDate: base.date,
    focus,
    existingReflection,
  });
  const morningGoalReview = firstLine(section(text, ["오늘 아침 핵심 목표 확인", "아침 핵심 목표 확인"]));

  return withCommon({
    automationType: "evening_reflection",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/reflections.json", "data/daily-focus-plans.json", "data/evidence-logs.json"],
    reflection: {
      ...operation.reflection,
      misses: lines(section(text, ["아쉬웠던 점 또는 막힌 점", "아쉬웠던 점/막힌 점", "막힌 점"])) || operation.reflection.misses,
    },
    evidenceLogs: [automationEvidence(base.date, sourceTitle, `저녁 회고 Import: ${morningGoalReview || "아침 목표 확인"}`, focus?.id)],
    missingFields: operation.missingFields,
    autoFilledFields: operation.autoFilledFields,
    overwrite: {
      reflection: Boolean(existingReflection),
    },
  });
}

function parseAbTest(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const phrase = firstLine(section(text, ["오늘의 문구"]));
  const abTestLog: ABTestLog = {
    ...base.entity,
    id: `ab-test-${base.date}-${slugify(phrase || "phrase")}`,
    title: phrase || "Daily Focus A/B 카드",
    description: firstLine(section(text, ["왜 이 문구가 효과 있을지"])) || "Daily Focus 문구 실험",
    category: "Daily Focus A/B",
    futureTableName: "ab_test_logs",
    testDate: base.date,
    phrase,
    variant: firstLine(section(text, ["실험 Variant", "Variant"])),
    judgementCriteria: firstLine(section(text, ["내 판단 기준", "판단 기준"])),
    result: firstLine(section(text, ["완료/미완료 판단", "결과", "사용자 답변"])),
    hypothesis: firstLine(section(text, ["왜 이 문구가 효과 있을지", "가설"])),
    similarTestIdea: firstLine(section(text, ["유사 테스트 아이디어"])),
    userFeedback: firstLine(section(text, ["사용자 답변", "완료/미완료/별로"])),
  };

  return withCommon({
    automationType: "daily_focus_ab_test",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/ab-test-logs.json", "data/reflections.json", "data/evidence-logs.json"],
    abTestLog,
    reflection: {
      selectedDate: base.date,
      completed: phrase ? [`A/B 문구 실험: ${phrase}`] : [],
      misses: [],
      tomorrowFirstAction: abTestLog.similarTestIdea,
      tomorrowGoalDraft: "다음 Daily Focus 문구 실험 후보를 정한다.",
      learnings: [abTestLog.hypothesis].filter(Boolean),
      applicationPoints: [abTestLog.judgementCriteria].filter(Boolean),
    },
    evidenceLogs: [automationEvidence(base.date, sourceTitle, "Daily Focus A/B 카드 저장", undefined)],
    missingFields: [phrase ? "" : "오늘의 문구"].filter(Boolean),
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${base.date}`],
    overwrite: {
      abTestLog: Boolean(context.abTestLogs?.some((item) => item.id === abTestLog.id)),
    },
  });
}

function parseFrameworkCheck(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const topic = firstLine(section(text, ["오늘의 주제", "주제"]));
  const relatedTechnology = inferTechnology(text);
  const aiFrameworkCheck: AIFrameworkCheck = {
    ...base.entity,
    id: `framework-check-${base.date}-${slugify(topic || relatedTechnology)}`,
    title: topic || "AI Framework Check",
    description: firstLine(section(text, ["30초 체크 질문", "체크 질문"])),
    category: relatedTechnology,
    futureTableName: "ai_framework_checks",
    checkDate: base.date,
    topic,
    checkQuestion: firstLine(section(text, ["30초 체크 질문", "체크 질문"])),
    answerOptions: lines(section(text, ["선택지", "안다/모른다/애매하다 선택지"])).length
      ? lines(section(text, ["선택지", "안다/모른다/애매하다 선택지"]))
      : ["안다", "모른다", "애매하다"],
    keyPoints: lines(section(text, ["핵심 포인트 3개", "핵심 포인트"])).slice(0, 3),
    relatedTechnology,
    sourceUrl: extractUrl(text),
  };
  const learningModule: LearningModule = {
    ...base.entity,
    id: `module-framework-${slugify(relatedTechnology)}`,
    title: topic || relatedTechnology,
    description: aiFrameworkCheck.checkQuestion || "AI Framework Check 관련 학습 모듈",
    category: relatedTechnology,
    futureTableName: "learning_modules",
    currentLevel: 2,
    targetLevel: 4,
    focusToday: true,
  };

  return withCommon({
    automationType: "ai_framework_check",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/ai-framework-checks.json", "data/learning-modules.json", "data/evidence-logs.json"],
    aiFrameworkCheck,
    learningModule,
    evidenceLogs: [automationEvidence(base.date, sourceTitle, "AI Framework Check 저장", undefined, learningModule.id)],
    missingFields: [topic ? "" : "오늘의 주제", aiFrameworkCheck.checkQuestion ? "" : "30초 체크 질문"].filter(Boolean),
    autoFilledFields: aiFrameworkCheck.answerOptions.length ? [] : ["answerOptions"],
    overwrite: {
      aiFrameworkCheck: Boolean(context.aiFrameworkChecks?.some((item) => item.id === aiFrameworkCheck.id)),
    },
  });
}

function parseReminderTask(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const title = firstLine(section(text, ["예약 제목", "산장 예약", "예약"])) || sourceTitle;
  const sourceUrl = firstLine(section(text, ["예약 사이트", "사이트"])) || extractUrl(text) || "";
  const reminderTask: ReminderTask = {
    ...base.entity,
    id: `reminder-${base.date}-${slugify(title)}`,
    title,
    description: firstLine(section(text, ["예약 대상", "대상"])) || "예약 리마인더",
    category: "Reservation",
    futureTableName: "reminder_tasks",
    reminderDate: base.date,
    targetDate: firstLine(section(text, ["예약 날짜", "날짜"])) || base.date,
    sourceUrl,
    triggerTime: firstLine(section(text, ["예약 오픈 시간", "오픈 시간", "triggerTime"])),
    status: "planned",
  };

  return withCommon({
    automationType: "reminder_task",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/reminder-tasks.json", "data/evidence-logs.json"],
    reminderTask,
    evidenceLogs: [automationEvidence(base.date, sourceTitle, `예약 리마인더 저장: ${title}`, undefined)],
    missingFields: [sourceUrl ? "" : "예약 사이트", reminderTask.triggerTime ? "" : "예약 오픈 시간"].filter(Boolean),
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${base.date}`],
    overwrite: {
      reminderTask: Boolean(context.reminderTasks?.some((item) => item.id === reminderTask.id)),
    },
  });
}

function parseWeeklyNewsSummary(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const targetWeek = getWeekKey(base.date);
  const koreaNews = sectionLines(text, ["한국 뉴스", "한국 Top 10", "Korea News"]);
  const usNews = sectionLines(text, ["미국 뉴스", "미국 Top 10", "US News"]);
  const globalNews = sectionLines(text, ["글로벌 뉴스", "글로벌 Top 10", "Global News"]);
  const aiNews = sectionLines(text, ["AI 뉴스", "AI News"]);
  const summary = sectionFirst(text, ["요약", "Summary"]);
  const weeklyNewsSummary: WeeklyNewsSummaryLog = {
    id: `news-summary-${targetWeek}`,
    targetWeek,
    generatedAt: base.entity.createdAt,
    koreaNews,
    usNews,
    globalNews,
    aiNews,
    summary,
    sourceAutomationType: "weekly_news_summary",
    dataSource: "chatgpt_automation",
  };

  return withCommon({
    automationType: "weekly_news_summary",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/news-summary-logs.json", "data/evidence-logs.json"],
    weeklyNewsSummary,
    evidenceLogs: [
      automationEvidence(base.date, sourceTitle, `주간 뉴스 요약 저장 (${targetWeek})`),
    ],
    missingFields: [
      koreaNews.length ? "" : "한국 뉴스",
      usNews.length ? "" : "미국 뉴스",
      globalNews.length ? "" : "글로벌 뉴스",
      aiNews.length ? "" : "AI 뉴스",
      summary ? "" : "요약",
    ].filter(Boolean),
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${base.date}`],
    overwrite: {
      weeklyNewsSummary: Boolean(
        context.weeklyNewsSummaries?.some((item) => item.targetWeek === targetWeek),
      ),
    },
  });
}

function parseWeeklyEtfReportCheck(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const targetWeek = getWeekKey(base.date);
  const reportUrl =
    sectionFirst(text, ["리포트 링크", "리포트 URL", "reportUrl"]) || extractUrl(text) || "";
  const keyChanges = sectionLines(text, ["주요 변화", "주요 변경", "Key Changes"]);
  const actionItems = sectionLines(text, ["Action Items", "후속 조치", "액션 아이템"]);
  const summary = sectionFirst(text, ["요약", "Summary"]);
  const investmentReportLog: InvestmentReportLog = {
    id: `etf-report-${targetWeek}`,
    targetWeek,
    reportType:
      sectionFirst(text, ["리포트 유형", "리포트 종류", "reportType"]) ||
      "weekly_etf_portfolio_report",
    reportUrl,
    keyChanges,
    summary,
    actionItems,
    sourceAutomationType: "weekly_etf_report_check",
    dataSource: "chatgpt_automation",
  };

  return withCommon({
    automationType: "weekly_etf_report_check",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/investment-report-logs.json", "data/evidence-logs.json"],
    investmentReportLog,
    evidenceLogs: [
      automationEvidence(base.date, sourceTitle, `주간 ETF 리포트 확인 저장 (${targetWeek})`),
    ],
    missingFields: [
      reportUrl ? "" : "리포트 링크",
      keyChanges.length ? "" : "주요 변화",
      summary ? "" : "요약",
    ].filter(Boolean),
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${base.date}`],
    overwrite: {
      investmentReportLog: Boolean(
        context.investmentReportLogs?.some((item) => item.targetWeek === targetWeek),
      ),
    },
  });
}

function parseWeeklyInvestmentSummary(
  text: string,
  base: ReturnType<typeof createBase>,
  sourceTitle: string,
  context: AutomationParseContext,
): AutomationImportPreview {
  const targetWeek = getWeekKey(base.date);
  const accountLines = sectionLines(text, ["계좌별 필요 금액", "계좌별 필요 현금"]);
  const requiredCashByAccount: Record<string, number> = {};
  for (const line of accountLines) {
    const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
    if (match) {
      requiredCashByAccount[match[1].trim()] = parseAmount(match[2]);
    }
  }
  const accounts = Object.keys(requiredCashByAccount);
  const assetNews = sectionLines(text, ["자산별 뉴스", "자산별 소식"]).map((line) => {
    const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
    const sourceUrl = line.match(/https?:\/\/\S+/)?.[0];
    return {
      asset: match ? match[1].trim() : line,
      summary: match ? match[2].replace(/https?:\/\/\S+/, "").trim() : "",
      sourceUrl,
    };
  });
  const actionItems = sectionLines(text, ["Action Items", "후속 조치", "액션 아이템"]);
  const summary = sectionFirst(text, ["요약", "Summary"]);
  const investmentSummaryLog: InvestmentSummaryLog = {
    id: `investment-summary-${targetWeek}`,
    targetWeek,
    accounts,
    requiredCashByAccount,
    grandTotalKrw: parseAmount(sectionFirst(text, ["총 필요 금액", "총합"])),
    fxRate: parseAmount(sectionFirst(text, ["환율", "USD/KRW"])),
    assetNews,
    actionItems,
    summary,
    sourceAutomationType: "weekly_investment_summary",
    dataSource: "chatgpt_automation",
  };

  return withCommon({
    automationType: "weekly_investment_summary",
    targetDate: base.date,
    sourceTitle,
    targetFiles: ["data/investment-summary-logs.json", "data/evidence-logs.json"],
    investmentSummaryLog,
    evidenceLogs: [
      automationEvidence(base.date, sourceTitle, `주간 투자 요약 저장 (${targetWeek})`),
    ],
    missingFields: [
      accounts.length ? "" : "계좌별 필요 금액",
      investmentSummaryLog.grandTotalKrw ? "" : "총 필요 금액",
      summary ? "" : "요약",
    ].filter(Boolean),
    autoFilledFields: extractDate(text) ? [] : [`targetDate: ${base.date}`],
    overwrite: {
      investmentSummaryLog: Boolean(
        context.investmentSummaryLogs?.some((item) => item.targetWeek === targetWeek),
      ),
    },
  });
}

function parseAmount(value: string): number {
  const digits = value.replace(/[^0-9.]/g, "");
  return digits ? Number(digits) : 0;
}

function sectionLines(text: string, aliases: string[]): string[] {
  const all = lines(section(text, aliases));
  const hintIndex = all.findIndex((line) => line.startsWith("[Dashboard Import Hint]"));
  const items = hintIndex >= 0 ? all.slice(0, hintIndex) : all;
  if (
    items.length &&
    aliases.some((alias) => normalize(items[0]).startsWith(normalize(alias)))
  ) {
    return items.slice(1);
  }
  return items;
}

function sectionFirst(text: string, aliases: string[]): string {
  return sectionLines(text, aliases)[0] ?? "";
}

function withCommon(
  preview: Omit<AutomationImportPreview, "warnings"> & {
    warnings?: string[];
  },
): AutomationImportPreview {
  return {
    ...preview,
    warnings: preview.warnings ?? [],
    missingFields: unique(preview.missingFields),
    autoFilledFields: unique(preview.autoFilledFields),
  };
}

function applyDashboardImportHint(
  preview: AutomationImportPreview,
  hint: ReturnType<typeof parseDashboardImportHint>,
): AutomationImportPreview {
  const targetFiles = mergeHintTargetFiles(preview.targetFiles, hint);
  return {
    ...preview,
    targetFiles,
    warnings: [
      ...preview.warnings,
      hint.primaryJson || hint.relatedJson.length > 0
        ? "Dashboard Import Hint의 primaryJson/relatedJson을 저장 대상 후보에 반영했습니다."
        : "",
    ].filter(Boolean),
  };
}

function buildDailyFocus({
  base,
  id,
  title,
  description,
  progress,
  relatedModuleId,
  subGoals,
  firstAction,
  completionCriteria,
  expectedOutput,
  mustNotMiss,
}: {
  base: ReturnType<typeof createBase>;
  id: string;
  title: string;
  description: string;
  progress: number;
  relatedModuleId?: string;
  subGoals: [string, string];
  firstAction: string;
  completionCriteria: string;
  expectedOutput: string;
  mustNotMiss: string;
}): DailyFocusPlan {
  return {
    ...base.entity,
    id,
    title,
    description,
    progress,
    category: "Imported Focus",
    futureTableName: "daily_focus_plans",
    relatedGoalId: "goal-daily-001",
    relatedModuleId,
    subGoals,
    firstAction,
    completionCriteria,
    expectedOutput,
    mustNotMiss,
    reviewNotes: "",
    subGoalStatuses: [false, false],
    firstActionDone: false,
    completionChecked: false,
    actualOutput: "",
    mustNotMissChecked: false,
    blockedReason: "",
    nextAction: "",
    selectedDate: base.date,
    weekKey: getWeekKey(base.date),
    monthKey: getMonthKey(base.date),
  };
}

function automationEvidence(
  selectedDate: string,
  title: string,
  note: string,
  relatedFocusId?: string,
  relatedModuleId?: string,
): EvidenceLogCreateInput {
  return {
    selectedDate,
    title,
    outputType: "문서",
    evidenceType: "automation_import",
    note,
    sourceUrl: "/import",
    relatedFocusId,
    relatedGoalId: "goal-daily-001",
    relatedModuleId,
  };
}

function createBase(date: string) {
  const now = new Date().toISOString();
  return {
    date,
    entity: {
      id: "",
      title: "",
      description: "",
      status: "in_progress" as const,
      progress: 30,
      category: "Automation Import",
      targetDate: date,
      createdAt: now,
      updatedAt: now,
      relatedGoalId: "goal-daily-001",
      dataSource: "mock" as const,
      futureTableName: "",
      automationReady: true,
    },
  };
}

function section(text: string, aliases: string[]): string {
  const normalized = text.replace(/\r\n/g, "\n");
  const linesList = normalized.split("\n");
  const start = linesList.findIndex((line) =>
    aliases.some((alias) => normalize(stripLabelOnly(line)).startsWith(normalize(alias))),
  );
  if (start === -1) {
    return "";
  }
  const first = stripValue(linesList[start]);
  const values = first ? [first] : [];
  for (let index = start + 1; index < linesList.length; index += 1) {
    const line = linesList[index];
    if (/^#{1,6}\s+/.test(line.trim()) || /^[*-]?\s*[^:：]{2,40}[:：]\s*$/.test(line.trim())) {
      break;
    }
    values.push(line);
  }
  return values.join("\n").trim();
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").replace(/^[0-9]+[.)]\s*/, "").trim())
    .filter(Boolean);
}

function firstLine(value: string): string {
  return lines(value)[0] ?? "";
}

function stripLabelOnly(value: string): string {
  return value.replace(/^#+\s*/, "").replace(/^[-*]\s*/, "").replace(/^[0-9]+[.)]\s*/, "").trim();
}

function stripValue(value: string): string {
  return stripLabelOnly(value).replace(/^([^:：]+)[:：]\s*/, "").trim();
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function extractDate(text: string): string | undefined {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
}

function getSourceTitle(text: string, automationType: AutomationType, date: string): string {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("#"))?.replace(/^#+\s*/, "") ||
    `${automationType} - ${date}`
  );
}

function findDailyFocus(items: DailyFocusPlan[] | undefined, date: string) {
  return items?.find((item) => item.selectedDate === date || item.targetDate === date);
}

function findReflection(items: Reflection[] | undefined, date: string) {
  return items?.find((item) => item.reflectionDate === date || item.targetDate === date);
}

function existsByDate<T extends { targetDate: string }>(
  items: T[] | undefined,
  date: string,
  field?: keyof T,
): boolean {
  return Boolean(
    items?.some((item) => String(field ? item[field] : item.targetDate) === date || item.targetDate === date),
  );
}

function inferTechnology(text: string): string {
  const candidates = ["RAG", "Agent", "Next.js", "Supabase", "Vercel", "UI/UX", "AI Framework"];
  return candidates.find((item) => text.toLowerCase().includes(item.toLowerCase())) ?? "AI Framework";
}

function extractUrl(text: string): string | undefined {
  return text.match(/https?:\/\/\S+/)?.[0];
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "automation";
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
