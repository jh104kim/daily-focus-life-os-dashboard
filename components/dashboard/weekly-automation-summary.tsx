import type {
  DeferredAutomationType,
  InvestmentReportLog,
  InvestmentSummaryLog,
  WeeklyAutomationStatus,
  WeeklyAutomationStatusCode,
  WeeklyNewsSummaryLog,
} from "@/lib/types";

interface WeeklyAutomationSummaryProps {
  selectedDate: string;
  weekKey: string;
  newsSummaries: WeeklyNewsSummaryLog[];
  investmentReports: InvestmentReportLog[];
  investmentSummaries: InvestmentSummaryLog[];
}

export function WeeklyAutomationSummary({
  selectedDate,
  weekKey,
  newsSummaries,
  investmentReports,
  investmentSummaries,
}: WeeklyAutomationSummaryProps) {
  const items = [
    createStatus({
      title: "Weekly News Summary",
      automationType: "weekly_news_summary",
      targetJson: "data/news-summary-logs.json",
      weekKey,
      recordCount: newsSummaries.filter((item) => item.targetWeek === weekKey).length,
      emptyDescription: "뉴스 요약: 데이터 없음 / parser pending",
      readyDescription: "이번 주 뉴스 요약 데이터가 준비되어 있습니다.",
      nextAction: "사용 빈도 확인 후 weekly_news_summary parser 구현 검토",
    }),
    createStatus({
      title: "ETF Report Check",
      automationType: "weekly_etf_report_check",
      targetJson: "data/investment-report-logs.json",
      weekKey,
      recordCount: investmentReports.filter((item) => item.targetWeek === weekKey).length,
      emptyDescription: "ETF 리포트: 데이터 없음 / parser pending",
      readyDescription: "이번 주 ETF 리포트 확인 데이터가 준비되어 있습니다.",
      nextAction: "ETF 리포트 원문 구조 확정 후 parser 구현 검토",
    }),
    createStatus({
      title: "Investment Summary",
      automationType: "weekly_investment_summary",
      targetJson: "data/investment-summary-logs.json",
      weekKey,
      recordCount: investmentSummaries.filter((item) => item.targetWeek === weekKey).length,
      emptyDescription: "투자 요약: 데이터 없음 / parser pending",
      readyDescription: "이번 주 투자 요약 데이터가 준비되어 있습니다.",
      nextAction: "투자 계좌/환율 필드 확정 후 parser 구현 검토",
    }),
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Weekly Automation Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            선택 날짜가 포함된 주간 자동화 후보 상태입니다.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right">
          <div className="text-xs font-medium text-slate-500">selected week</div>
          <div className="mt-1 font-mono text-sm font-semibold text-slate-950">
            {weekKey}
          </div>
          <div className="font-mono text-xs text-slate-500">{selectedDate}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.automationType}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {item.automationType}
                </p>
              </div>
              <StatusPill status={item.status} />
            </div>

            <dl className="mt-4 space-y-3 text-xs">
              <div>
                <dt className="font-semibold text-slate-500">targetJson</dt>
                <dd className="mt-1 break-all font-mono text-slate-800">
                  {item.targetJson}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">description</dt>
                <dd className="mt-1 leading-5 text-slate-700">{item.description}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">nextAction</dt>
                <dd className="mt-1 leading-5 text-slate-700">{item.nextAction}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function createStatus({
  title,
  automationType,
  targetJson,
  weekKey,
  recordCount,
  emptyDescription,
  readyDescription,
  nextAction,
}: {
  title: string;
  automationType: DeferredAutomationType;
  targetJson: string;
  weekKey: string;
  recordCount: number;
  emptyDescription: string;
  readyDescription: string;
  nextAction: string;
}): WeeklyAutomationStatus {
  return {
    title,
    automationType,
    targetJson,
    status: getStatus(recordCount),
    description:
      recordCount > 0
        ? `${readyDescription} (${weekKey}, ${recordCount}건)`
        : emptyDescription,
    nextAction,
  };
}

function getStatus(recordCount: number): WeeklyAutomationStatusCode {
  return recordCount > 0 ? "ready" : "parser_pending";
}

function StatusPill({ status }: { status: WeeklyAutomationStatusCode }) {
  const styles: Record<WeeklyAutomationStatusCode, string> = {
    pending_schema: "border-amber-200 bg-amber-50 text-amber-700",
    parser_pending: "border-violet-200 bg-violet-50 text-violet-700",
    no_data: "border-slate-200 bg-white text-slate-500",
    ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-1 font-mono text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
