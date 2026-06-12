import type { ParsedAutomationImport } from "@/lib/types";

interface ImportPreviewProps {
  parsed: ParsedAutomationImport | null;
}

export function ImportPreview({ parsed }: ImportPreviewProps) {
  if (!parsed) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-slate-950">미리보기</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          자동화 결과를 붙여넣고 미리보기를 누르면 저장될 Daily Focus, Learning,
          AI/AX, Evidence 항목이 여기 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
          {parsed.date}
        </span>
        <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700">
          preview
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{parsed.coreGoal}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <PreviewField label="오늘의 학습/실행 모듈" value={parsed.learningModuleTitle} />
        <PreviewField label="오늘의 진행률 목표" value={`${parsed.progressGoal}%`} />
        <PreviewField label="완료 기준" value={parsed.completionCriteria} />
        <PreviewField label="남은 과제" value={parsed.remainingTasks} />
        <PreviewField label="예상 산출물" value={parsed.expectedOutput} />
        <PreviewField label="오늘 첫 행동" value={parsed.firstAction} />
        <PreviewField label="내 업무 문제" value={parsed.businessProblem} />
        <PreviewField label="AI로 바꿀 수 있는 형태" value={parsed.aiTransformedForm} />
        <PreviewField label="필요한 기술" value={parsed.requiredSkills.join(", ")} />
        <PreviewField label="예상 자동화 효과" value={parsed.expectedEffect} />
      </div>
    </section>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value || "-"}</p>
    </div>
  );
}
