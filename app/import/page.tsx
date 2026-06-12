import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { AutomationImportForm } from "@/components/import/automation-import-form";

export default function ImportPage() {
  return (
    <div>
      <SectionHeader
        title="Import"
        description="ChatGPT 자동화 결과를 그대로 붙여넣으세요. 미리보기 후 저장하면 data/*.json 파일에 반영됩니다."
        futureTableName="daily_focus_plans / learning_modules / ai_applications / evidence_logs"
      />
      <AutomationImportForm />
      <SourceFooter tableName="daily_focus_plans, learning_modules, ai_applications, evidence_logs" />
    </div>
  );
}
