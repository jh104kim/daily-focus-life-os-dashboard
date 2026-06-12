import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RelatedLink } from "@/components/dashboard/related-link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { learningModules } from "@/lib/mock-data";
import type { AiApplication } from "@/lib/types";

interface AiApplicationCardProps {
  application: AiApplication;
}

export function AiApplicationCard({ application }: AiApplicationCardProps) {
  const relatedModules = learningModules.filter((module) =>
    application.relatedLearningModuleIds.includes(module.id),
  );

  return (
    <article id={application.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status={application.status} />
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
              score {application.automationScore}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-950">{application.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{application.description}</p>
        </div>
        <div className="min-w-56">
          <ProgressBar value={application.automationScore} label="자동화 가능성" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="내 업무 문제" value={application.businessProblem} />
        <Field label="AI로 해결 가능한 형태" value={application.aiSolvableForm} />
        <Field label="예상 자동화 효과" value={application.expectedAutomationEffect} />
        <Field label="적용 대상 업무" value={application.targetWork} />
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-medium text-slate-500">필요한 기술</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {application.requiredSkills.map((skill) => (
            <span key={skill} className="rounded-md bg-white px-2 py-1 text-xs text-slate-700">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        {application.relatedGoalId ? (
          <span>
            관련 목표:{" "}
            <RelatedLink href={`/goals#${application.relatedGoalId}`} label={application.relatedGoalId} />
          </span>
        ) : null}
        {relatedModules.map((module) => (
          <span key={module.id}>
            학습 모듈: <RelatedLink href={`/learning#${module.id}`} label={module.title} />
          </span>
        ))}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
