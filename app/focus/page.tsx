import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { DailyFocusCard } from "@/components/focus/daily-focus-card";
import { dailyFocusPlans } from "@/lib/mock-data";

export default function FocusPage() {
  return (
    <div>
      <SectionHeader
        title="Daily Focus Plan"
        description="오늘의 핵심 목표, 서브 목표, 첫 행동, 완료 기준, 예상 산출물을 관리합니다."
        futureTableName="daily_focus_plans"
      />
      <div className="space-y-4">
        {dailyFocusPlans.map((plan) => (
          <DailyFocusCard key={plan.id} plan={plan} />
        ))}
      </div>
      <SourceFooter tableName="daily_focus_plans" />
    </div>
  );
}
