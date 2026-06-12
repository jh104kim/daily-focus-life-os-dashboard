import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { BulkAutomationImportConsole } from "@/components/input/bulk-automation-import-console";

export default function ImportPage() {
  return (
    <div>
      <SectionHeader
        title="Bulk Automation Import Console"
        description="ChatGPT 자동화 결과, Daily Focus 업데이트, 운영 기록을 한 번에 붙여넣고 block별 Diff를 확인한 뒤 선택 저장합니다."
        futureTableName="daily_focus_plans / reflections / evidence_logs / automation_logs"
      />
      <BulkAutomationImportConsole />
      <SourceFooter tableName="daily_focus_plans, learning_modules, ai_applications, reflections, evidence_logs, brief_logs, ab_test_logs, ai_framework_checks, reminder_tasks" />
    </div>
  );
}
