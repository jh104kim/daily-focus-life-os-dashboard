export type DataSource =
  | "mock"
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
}

export interface DailyFocusPlan extends BaseEntity {
  subGoals: [string, string];
  firstAction: string;
  completionCriteria: string;
  expectedOutput: string;
  mustNotMiss: string;
}

export type GoalLevel = "north_star" | "monthly" | "weekly" | "daily";

export interface Goal extends BaseEntity {
  level: GoalLevel;
  parentGoalId?: string;
  relatedDailyFocusId?: string;
}

export interface AiApplication extends BaseEntity {
  businessProblem: string;
  aiSolvableForm: string;
  requiredSkills: string[];
  expectedAutomationEffect: string;
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
  tomorrowFirstAction: string;
  tomorrowGoalDraft: string;
  learnings: string[];
  applicationPoints: string[];
  autoFillCandidates: string[];
}

export type EvidenceType = "문서" | "코드" | "대시보드" | "회고";

export interface EvidenceLog extends BaseEntity {
  outputType: EvidenceType;
  artifactLink: string;
  note: string;
  obsidianCandidatePath: string;
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

export interface ParsedAutomationImport {
  date: string;
  coreGoal: string;
  learningModuleTitle: string;
  progressGoal: number;
  completionCriteria: string;
  remainingTasks: string;
  expectedOutput: string;
  businessProblem: string;
  aiTransformedForm: string;
  requiredSkills: string[];
  expectedEffect: string;
  firstAction: string;
  sourceTitle: string;
}

export interface ImportDailyFocusResponse {
  success: boolean;
  parsed?: ParsedAutomationImport;
  updatedFiles?: string[];
  message: string;
}
