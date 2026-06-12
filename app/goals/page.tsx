import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { GoalTable } from "@/components/goals/goal-table";
import { goals } from "@/lib/mock-data";

export default function GoalsPage() {
  return (
    <div>
      <SectionHeader
        title="Goal Management"
        description="북극성, 월간, 주간, 오늘 목표를 계층 구조로 보고 진행률과 관련 Focus를 연결합니다."
        futureTableName="goals"
      />
      <GoalTable goals={goals} />
      <SourceFooter tableName="goals" />
    </div>
  );
}
