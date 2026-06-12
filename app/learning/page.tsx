import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { LearningModuleCard } from "@/components/learning/learning-module-card";
import { learningModules } from "@/lib/mock-data";

export default function LearningPage() {
  return (
    <div>
      <SectionHeader
        title="Learning / Skill Map"
        description="AI Essential, RAG, Agentic Workflow, Evaluation, AI Coding, Dashboard 역량을 현재 수준과 목표 수준으로 관리합니다."
        futureTableName="learning_modules"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learningModules.map((module) => (
          <LearningModuleCard key={module.id} module={module} />
        ))}
      </div>
      <SourceFooter tableName="learning_modules" />
    </div>
  );
}
