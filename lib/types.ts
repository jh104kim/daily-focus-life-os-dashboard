export type DataSource =
  | "mock"
  | "chatgpt_automation"
  | "future_supabase"
  | "future_obsidian"
  | "future_json";

export type Status = "planned" | "in_progress" | "done" | "blocked";

export interface BaseEntity {
  id: string;
  title: string;
  description: string;
  status: Status;
  progress: number;
  category: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  relatedGoalId?: string;
  relatedModuleId?: string;
  dataSource: DataSource;
  futureTableName: string;
  automationReady: boolean;
  sourceAutomationType?: AutomationType;
  originalText?: string;
  importBatchId?: string;
  importBlockId?: string;
}

export interface DailyFocusPlan extends BaseEntity {
  subGoals: [string, string];
  firstAction: string;
  completionCriteria: string;
  expectedOutput: string;
  mustNotMiss: string;
  reviewNotes?: string;
  subGoalStatuses?: boolean[];
  firstActionDone?: boolean;
  completionChecked?: boolean;
  actualOutput?: string;
  mustNotMissChecked?: boolean;
  blockedReason?: string;
  nextAction?: string;
  selectedDate?: string;
  weekKey?: string;
  monthKey?: string;
}

export type GoalLevel = "north_star" | "monthly" | "weekly" | "daily";

export interface Goal extends BaseEntity {
  level: GoalLevel;
  goalLevel?: GoalLevel;
  weekKey?: string;
  monthKey?: string;
  parentGoalId?: string;
  relatedDailyFocusId?: string;
}

export interface AiApplication extends BaseEntity {
  businessProblem: string;
  workProblem?: string;
  aiSolvableForm: string;
  aiTransformedForm?: string;
  requiredSkills: string[];
  expectedAutomationEffect: string;
  expectedEffect?: string;
  targetWork: string;
  relatedLearningModuleIds: string[];
  automationScore: number;
}

export interface LearningModule extends BaseEntity {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  targetLevel: 1 | 2 | 3 | 4 | 5;
  focusToday: boolean;
}

export interface Reflection extends BaseEntity {
  completed: string[];
  misses: string[];
  blockers?: string[];
  morningGoalReview?: string;
  tomorrowFirstAction: string;
  tomorrowGoalDraft: string;
  learnings: string[];
  applicationPoints: string[];
  autoFillCandidates: string[];
  relatedFocusId?: string;
  reflectionDate?: string;
  appliedToWork?: string[];
}

export type EvidenceType = "문서" | "코드" | "대시보드" | "회고";

export interface EvidenceLog extends BaseEntity {
  outputType: EvidenceType;
  evidenceType?: string;
  artifactLink: string;
  sourceUrl?: string;
  note: string;
  obsidianCandidatePath: string;
  evidenceDate?: string;
  relatedFocusId?: string;
  reviewStatus?: "pending" | "reviewed" | "applied";
}

export interface AutomationRoadmapItem extends BaseEntity {
  stage: number;
  todos: string[];
  requiredSkills: string[];
  blockers: string[];
  isCurrent: boolean;
}

export interface DataSourceStatus extends BaseEntity {
  connector: "Supabase" | "Obsidian" | "JSON" | "ChatGPT" | "Local";
  tableCandidate: string;
  nextAction: string;
}

export type AutomationType =
  | "oflow_morning_brief"
  | "ai_education_focus"
  | "evening_reflection"
  | "daily_focus_ab_test"
  | "ai_framework_check"
  | "reminder_task"
  | "daily_focus_update"
  | "daily_operation_log"
  | "unknown";

export type DeferredAutomationType =
  | "weekly_news_summary"
  | "weekly_etf_report_check"
  | "weekly_investment_summary";

export type WeeklyAutomationStatusCode =
  | "pending_schema"
  | "parser_pending"
  | "no_data"
  | "ready";

export interface WeeklyAutomationStatus {
  title: string;
  automationType: DeferredAutomationType;
  targetJson: string;
  status: WeeklyAutomationStatusCode;
  description: string;
  nextAction: string;
}

export interface BriefLog extends BaseEntity {
  briefDate: string;
  calendarSummary: string;
  gmailSummary: string;
  slackSummary: string;
  automationStatus: string;
  priorityDecision: string;
}

export interface ABTestLog extends BaseEntity {
  testDate: string;
  phrase: string;
  variant: string;
  judgementCriteria: string;
  result: string;
  hypothesis: string;
  similarTestIdea: string;
  userFeedback: string;
}

export interface AIFrameworkCheck extends BaseEntity {
  checkDate: string;
  topic: string;
  checkQuestion: string;
  answerOptions: string[];
  keyPoints: string[];
  relatedTechnology: string;
  sourceUrl?: string;
}

export interface ReminderTask extends BaseEntity {
  reminderDate: string;
  sourceUrl: string;
  triggerTime: string;
}

export interface WeeklyNewsSummaryLog {
  id: string;
  targetWeek: string;
  generatedAt: string;
  koreaNews: string[];
  usNews: string[];
  globalNews: string[];
  aiNews: string[];
  summary: string;
  sourceAutomationType: "weekly_news_summary";
  dataSource: DataSource;
  importBatchId?: string;
}

export interface InvestmentReportLog {
  id: string;
  targetWeek: string;
  reportType: string;
  reportUrl: string;
  keyChanges: string[];
  summary: string;
  actionItems: string[];
  sourceAutomationType: "weekly_etf_report_check";
  dataSource: DataSource;
  importBatchId?: string;
}

export interface InvestmentSummaryLog {
  id: string;
  targetWeek: string;
  accounts: string[];
  requiredCashByAccount: Record<string, number>;
  grandTotalKrw: number;
  fxRate: number;
  assetNews: Array<{
    asset: string;
    summary: string;
    sourceUrl?: string;
  }>;
  actionItems: string[];
  summary: string;
  sourceAutomationType: "weekly_investment_summary";
  dataSource: DataSource;
  importBatchId?: string;
}

export interface ParsedAutomationImport {
  date: string;
  usedFallbackDate: boolean;
  coreGoal: string;
  learningModuleTitle: string;
  progressGoal: number;
  usedFallbackProgress: boolean;
  completionCriteria: string;
  remainingTasks: string;
  expectedOutput: string;
  businessProblem: string;
  aiTransformedForm: string;
  requiredSkills: string[];
  usedFallbackSkills: boolean;
  expectedEffect: string;
  firstAction: string;
  sourceTitle: string;
  missingFields: string[];
  autoFilledFields: string[];
  overwrite: {
    dailyFocusPlan: boolean;
    aiApplication: boolean;
    evidenceLog: boolean;
    learningModule: boolean;
  };
}

export interface ImportDailyFocusResponse {
  success: boolean;
  parsed?: ParsedAutomationImport;
  updatedFiles?: string[];
  message: string;
}

export interface AutomationImportLog {
  id: string;
  importedAt: string;
  source: string;
  targetDate: string;
  status: "success" | "failed";
  warnings: string[];
  updatedFiles: string[];
}

export interface DashboardData {
  dailyFocusPlans: DailyFocusPlan[];
  goals: Goal[];
  aiApplications: AiApplication[];
  learningModules: LearningModule[];
  reflections: Reflection[];
  evidenceLogs: EvidenceLog[];
  briefLogs: BriefLog[];
  abTestLogs: ABTestLog[];
  aiFrameworkChecks: AIFrameworkCheck[];
  reminderTasks: ReminderTask[];
  weeklyNewsSummaries: WeeklyNewsSummaryLog[];
  investmentReportLogs: InvestmentReportLog[];
  investmentSummaryLogs: InvestmentSummaryLog[];
}

export interface DailyFocusReviewUpdate {
  id: string;
  reviewNotes?: string;
  subGoalStatuses?: boolean[];
  firstActionDone?: boolean;
  completionChecked?: boolean;
  actualOutput?: string;
  mustNotMissChecked?: boolean;
  progress?: number;
  status?: Status;
  blockedReason?: string;
  nextAction?: string;
}

export interface ReflectionUpsertInput {
  id?: string;
  selectedDate: string;
  relatedFocusId?: string;
  relatedGoalId?: string;
  relatedModuleId?: string;
  completed: string[];
  misses: string[];
  tomorrowFirstAction: string;
  tomorrowGoalDraft: string;
  learnings: string[];
  applicationPoints: string[];
  sourceAutomationType?: AutomationType;
  originalText?: string;
  importBatchId?: string;
  importBlockId?: string;
}

export interface EvidenceLogCreateInput {
  selectedDate: string;
  title: string;
  outputType: EvidenceType;
  evidenceType?: string;
  note: string;
  sourceUrl?: string;
  relatedFocusId?: string;
  relatedGoalId?: string;
  relatedModuleId?: string;
  sourceAutomationType?: AutomationType;
  originalText?: string;
  importBatchId?: string;
  importBlockId?: string;
}

export interface ParsedDailyOperationImport {
  selectedDate: string;
  reflection: ReflectionUpsertInput;
  evidenceLogs: EvidenceLogCreateInput[];
  missingFields: string[];
  autoFilledFields: string[];
  schemaTargets: Array<"reflections" | "evidence_logs">;
  overwrite: {
    reflection: boolean;
  };
}

export interface AutomationImportPreview {
  automationType: AutomationType;
  targetDate: string;
  sourceTitle: string;
  targetFiles: string[];
  dailyFocusPlan?: DailyFocusPlan;
  learningModule?: LearningModule;
  aiApplication?: AiApplication;
  reflection?: ReflectionUpsertInput;
  evidenceLogs: EvidenceLogCreateInput[];
  briefLog?: BriefLog;
  abTestLog?: ABTestLog;
  aiFrameworkCheck?: AIFrameworkCheck;
  reminderTask?: ReminderTask;
  missingFields: string[];
  autoFilledFields: string[];
  warnings: string[];
  overwrite: Record<string, boolean>;
}

export interface JsonFieldChange {
  field: string;
  before: unknown;
  after: unknown;
  important: boolean;
}

export interface JsonRecordSummary {
  id?: string;
  title?: string;
  targetDate?: string;
}

export interface JsonRecordDiff extends JsonRecordSummary {
  changedFields: JsonFieldChange[];
}

export interface JsonFileDiff {
  fileName: string;
  added: JsonRecordSummary[];
  updated: JsonRecordDiff[];
  removed: JsonRecordSummary[];
}

export type SelectedImportAction = "add" | "update";

export interface SelectedImportChange {
  fileName: string;
  action: SelectedImportAction;
  id?: string;
  title?: string;
  targetDate?: string;
  selectedFields?: string[];
}

export interface SelectedImportPayload {
  selectedChanges: SelectedImportChange[];
}

export interface SelectedImportSummary {
  selectedSave: boolean;
  savedFileCount: number;
  savedRecordCount: number;
  savedFieldCount: number;
  excludedRecordCount: number;
}

export interface AutomationBlock {
  importBlockId: string;
  rawText: string;
  automationType: AutomationType;
  targetDate: string;
  sourceTitle: string;
}

export interface BulkAutomationImportPreview {
  importBatchId: string;
  detectedBlockCount: number;
  parsedBlockCount: number;
  unknownBlockCount: number;
  automationTypes: AutomationType[];
  targetFiles: string[];
  blocks: Array<{
    importBlockId: string;
    automationType: AutomationType;
    targetDate: string;
    sourceTitle: string;
    targetFiles: string[];
    success: boolean;
    warnings: string[];
    missingFields: string[];
    autoFilledFields: string[];
  }>;
  previews: AutomationImportPreview[];
  unknownBlocks: AutomationBlock[];
  diff: JsonFileDiff[];
  warnings: string[];
}
