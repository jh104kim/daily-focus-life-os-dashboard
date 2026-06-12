import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RelatedLink } from "@/components/dashboard/related-link";
import {
  aiApplications,
  dailyFocusPlans,
  dataSourceStatus,
  evidenceLogs,
  goals,
  reflections,
} from "@/lib/mock-data";
import { calcOverallProgress, sortByUpdatedAt } from "@/lib/dashboard-utils";

export default function Home() {
  const todayFocus = dailyFocusPlans.find((plan) => plan.status === "in_progress") ?? dailyFocusPlans[0];
  const completedGoalCount = goals.filter((goal) => goal.status === "done").length;
  const remainingTaskCount = dailyFocusPlans.filter((plan) => plan.status !== "done").length;
  const latestReflection = sortByUpdatedAt(reflections)[0];
  const latestEvidence = sortByUpdatedAt(evidenceLogs).slice(0, 2);
  const overallProgress = calcOverallProgress([...dailyFocusPlans, ...goals, ...aiApplications]);

  return (
    <div>
      <SectionHeader
        title="Home Dashboard"
        description="오늘 목표, 실행 상태, 회고, 산출물, 자동 업데이트 준비도를 한 화면에서 확인합니다."
        futureTableName="daily_focus_plans / goals / data_sources"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="오늘 핵심 목표"
          value={todayFocus.title}
          detail={todayFocus.firstAction}
          tone="cyan"
        />
        <KpiCard
          label="오늘의 진행률"
          value={`${overallProgress}%`}
          detail="Focus, Goals, AI 적용 후보 평균 진행률"
          tone="emerald"
        />
        <KpiCard
          label="완료한 목표 수"
          value={`${completedGoalCount}개`}
          detail="현재 mock goals 기준 완료 상태"
          tone="amber"
        />
        <KpiCard
          label="남은 과제 수"
          value={`${remainingTaskCount}개`}
          detail="Daily Focus Plan 중 완료되지 않은 항목"
          tone="rose"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={todayFocus.status} />
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
              {todayFocus.futureTableName}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-950">{todayFocus.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{todayFocus.description}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="오늘 첫 행동" value={todayFocus.firstAction} />
            <Info label="오늘 놓치면 안 되는 것" value={todayFocus.mustNotMiss} />
          </div>
          <div className="mt-5">
            <ProgressBar value={todayFocus.progress} />
          </div>
          <div className="mt-4 text-sm">
            <RelatedLink href={`/focus#${todayFocus.id}`} label="Daily Focus 상세 보기" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">최근 회고 요약</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{latestReflection.description}</p>
          <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">내일 첫 행동 후보</div>
            <p className="mt-1 text-sm leading-6 text-slate-800">
              {latestReflection.tomorrowFirstAction}
            </p>
          </div>
          <div className="mt-4 text-sm">
            <RelatedLink href={`/reflection#${latestReflection.id}`} label="회고 상세 보기" />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">최근 산출물 로그</h2>
          <div className="mt-4 space-y-3">
            {latestEvidence.map((log) => (
              <div key={log.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-700">
                    {log.outputType}
                  </span>
                  <StatusBadge status={log.status} />
                </div>
                <div className="mt-2 font-medium text-slate-950">{log.title}</div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{log.note}</p>
                <div className="mt-2 text-sm">
                  <RelatedLink href={`/evidence#${log.id}`} label="산출물 열기" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">향후 자동 업데이트 상태</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {dataSourceStatus.map((source) => (
              <div key={source.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-slate-700">{source.tableCandidate}</span>
                  <StatusBadge status={source.status} />
                </div>
                <ProgressBar value={source.progress} label={source.connector} />
                <p className="mt-2 text-xs leading-5 text-slate-600">{source.nextAction}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SourceFooter tableName="daily_focus_plans, goals, ai_applications, data_sources" />
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
