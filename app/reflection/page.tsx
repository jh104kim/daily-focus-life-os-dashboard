import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { ReflectionCard } from "@/components/reflection/reflection-card";
import { sortByUpdatedAt } from "@/lib/dashboard-utils";
import { reflections } from "@/lib/mock-data";

export default function ReflectionPage() {
  return (
    <div>
      <SectionHeader
        title="Evening Reflection"
        description="오늘 완료한 것, 막힌 점, 내일 첫 행동, 배운 것과 업무 적용 지점을 회고합니다."
        futureTableName="reflections"
      />
      <div className="space-y-4">
        {sortByUpdatedAt(reflections).map((reflection) => (
          <ReflectionCard key={reflection.id} reflection={reflection} />
        ))}
      </div>
      <SourceFooter tableName="reflections" />
    </div>
  );
}
