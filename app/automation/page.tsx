import { AutomationRoadmap } from "@/components/automation/automation-roadmap";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { automationRoadmap } from "@/lib/mock-data";

export default function AutomationPage() {
  return (
    <div>
      <SectionHeader
        title="Automation Roadmap"
        description="mock dashboard에서 Supabase 연결, ChatGPT 결과 저장, 자동 업데이트, 로컬 자동 실행까지의 단계별 Todo를 관리합니다."
        futureTableName="automation_runs"
      />
      <AutomationRoadmap items={automationRoadmap} />
      <SourceFooter tableName="automation_runs" />
    </div>
  );
}
