import { AiApplicationCard } from "@/components/ai-ax/ai-application-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { aiApplications } from "@/lib/mock-data";

export default function AiAxPage() {
  return (
    <div>
      <SectionHeader
        title="AI/AX Application"
        description="업무 문제를 AI가 해결 가능한 형태로 바꾸고 필요한 기술과 자동화 효과를 비교합니다."
        futureTableName="ai_applications"
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {aiApplications.map((application) => (
          <AiApplicationCard key={application.id} application={application} />
        ))}
      </div>
      <SourceFooter tableName="ai_applications" />
    </div>
  );
}
