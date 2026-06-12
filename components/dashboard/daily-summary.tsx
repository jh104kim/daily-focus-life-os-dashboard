import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type {
  AiApplication,
  DailyFocusPlan,
  EvidenceLog,
  LearningModule,
  Reflection,
} from "@/lib/types";

interface DailySummaryProps {
  selectedDate: string;
  focus: DailyFocusPlan | undefined;
  aiApplications: AiApplication[];
  learningModules: LearningModule[];
  evidenceLogs: EvidenceLog[];
  reflection: Reflection | undefined;
}

export function DailySummary({
  selectedDate,
  focus,
  aiApplications,
  learningModules,
  evidenceLogs,
  reflection,
}: DailySummaryProps) {
  const relatedLearning = learningModules.find(
    (module) => module.id === focus?.relatedModuleId,
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        {focus ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={focus.status} />
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
                {selectedDate}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-slate-950">{focus.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{focus.description}</p>
            <div className="mt-5">
              <ProgressBar value={focus.progress} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Info label="서브 목표 1" value={focus.subGoals[0]} />
              <Info label="서브 목표 2" value={focus.subGoals[1]} />
              <Info label="오늘 첫 행동" value={focus.firstAction} />
              <Info label="완료 기준" value={focus.completionCriteria} />
              <Info label="예상 산출물" value={focus.expectedOutput} />
              <Info label="놓치면 안 되는 것" value={focus.mustNotMiss} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Info
                label="연결된 Learning Module"
                value={relatedLearning?.title ?? focus.relatedModuleId ?? "-"}
              />
              <Info
                label="해당 날짜 Reflection"
                value={reflection?.title ?? "아직 회고가 없습니다."}
              />
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">선택 날짜 Daily Focus</h2>
            <p className="mt-2 text-sm text-slate-600">
              {selectedDate}에 등록된 Daily Focus가 없습니다. Import 버튼으로 자동화
              결과를 저장하세요.
            </p>
          </section>
        )}
        <section className="space-y-5">
          <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
            <div className="text-sm font-semibold text-cyan-950">입력은 Bulk Console로 통합됨</div>
            <p className="mt-2 text-sm leading-6 text-cyan-800">
              Daily Focus 검토/업데이트, 저녁 회고, Evidence Log는 상단의
              자동화 결과 Import 버튼에서 한 번에 붙여넣고 Diff 확인 후 저장합니다.
            </p>
          </section>
          <SideList title="AI/AX 적용 관점" items={aiApplications.map((item) => item.title)} />
          <SideList title="연결 Evidence Log" items={evidenceLogs.map((item) => item.title)} />
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function SideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <div key={item} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">연결 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
