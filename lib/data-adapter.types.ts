import type {
  AiApplication,
  AutomationImportLog,
  DailyFocusPlan,
  EvidenceLog,
  Goal,
  LearningModule,
  Reflection,
} from "./types";

export interface RepositoryQueryOptions {
  limit?: number;
  offset?: number;
}

export interface DateQueryOptions extends RepositoryQueryOptions {
  dateField?: string;
}

export interface WeekQueryOptions extends RepositoryQueryOptions {
  weekField?: string;
}

export interface MonthQueryOptions extends RepositoryQueryOptions {
  monthField?: string;
}

export interface RepositoryMutationResult<T> {
  record: T;
  created: boolean;
}

export interface BaseRepository<TRecord extends { id: string }> {
  list(options?: RepositoryQueryOptions): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord | null>;
  getByDate(date: string, options?: DateQueryOptions): Promise<TRecord[]>;
  upsert(record: TRecord): Promise<RepositoryMutationResult<TRecord>>;
  update(id: string, patch: Partial<TRecord>): Promise<TRecord | null>;
  remove(id: string): Promise<boolean>;
  queryByWeek(weekKey: string, options?: WeekQueryOptions): Promise<TRecord[]>;
  queryByMonth(monthKey: string, options?: MonthQueryOptions): Promise<TRecord[]>;
}

export interface DailyFocusRepository extends BaseRepository<DailyFocusPlan> {
  getBySelectedDate(date: string): Promise<DailyFocusPlan | null>;
}

export interface GoalRepository extends BaseRepository<Goal> {
  listByLevel(level: Goal["level"]): Promise<Goal[]>;
  listChildren(parentGoalId: string): Promise<Goal[]>;
}

export interface LearningModuleRepository extends BaseRepository<LearningModule> {
  listFocusToday(): Promise<LearningModule[]>;
}

export interface AIApplicationRepository extends BaseRepository<AiApplication> {
  listByRelatedModule(moduleId: string): Promise<AiApplication[]>;
}

export interface ReflectionRepository extends BaseRepository<Reflection> {
  getByReflectionDate(date: string): Promise<Reflection | null>;
}

export interface EvidenceLogRepository extends BaseRepository<EvidenceLog> {
  listByRelatedFocus(focusId: string): Promise<EvidenceLog[]>;
  listByEvidenceDate(date: string): Promise<EvidenceLog[]>;
}

export interface AutomationImportLogRepository
  extends Omit<
    BaseRepository<AutomationImportLog>,
    "queryByWeek" | "queryByMonth"
  > {
  listByStatus(status: AutomationImportLog["status"]): Promise<AutomationImportLog[]>;
  listByImportedDate(date: string): Promise<AutomationImportLog[]>;
}

export interface LifeOsDataAdapter {
  dailyFocus: DailyFocusRepository;
  goals: GoalRepository;
  learningModules: LearningModuleRepository;
  aiApplications: AIApplicationRepository;
  reflections: ReflectionRepository;
  evidenceLogs: EvidenceLogRepository;
  automationImportLogs: AutomationImportLogRepository;
}

export type DataAdapterKind = "json" | "supabase";
