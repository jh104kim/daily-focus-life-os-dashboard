import { CalendarDashboard } from "@/components/dashboard/calendar-dashboard";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import {
  aiApplications,
  abTestLogs,
  aiFrameworkChecks,
  briefLogs,
  dailyFocusPlans,
  evidenceLogs,
  goals,
  investmentReportLogs,
  investmentSummaryLogs,
  learningModules,
  weeklyNewsSummaries,
  reminderTasks,
  reflections,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div>
      <SectionHeader
        title="Home Dashboard"
        description="캘린더에서 날짜를 선택하고 주간, 일간, 월간 실행 상태를 한 화면에서 운영합니다."
        futureTableName="daily_focus_plans / goals / learning_modules / evidence_logs"
      />
      <CalendarDashboard
        initialData={{
          dailyFocusPlans,
          goals,
          aiApplications,
          learningModules,
          reflections,
          evidenceLogs,
          briefLogs,
          abTestLogs,
          aiFrameworkChecks,
          reminderTasks,
          weeklyNewsSummaries,
          investmentReportLogs,
          investmentSummaryLogs,
        }}
      />
      <SourceFooter tableName="daily_focus_plans, goals, ai_applications, learning_modules, evidence_logs" />
    </div>
  );
}
