import type { ABTestLog, AIFrameworkCheck, BriefLog, EvidenceLog, ReminderTask } from "@/lib/types";

interface AutomationLogSummaryProps {
  briefLogs: BriefLog[];
  abTestLogs: ABTestLog[];
  aiFrameworkChecks: AIFrameworkCheck[];
  reminderTasks: ReminderTask[];
  evidenceLogs: EvidenceLog[];
}

export function AutomationLogSummary({
  briefLogs,
  abTestLogs,
  aiFrameworkChecks,
  reminderTasks,
  evidenceLogs,
}: AutomationLogSummaryProps) {
  const groups = [
    { title: "Brief Log", items: briefLogs.map((item) => item.title) },
    { title: "A/B Test Log", items: abTestLogs.map((item) => `${item.variant || "variant"} · ${item.phrase}`) },
    { title: "AI Framework Check", items: aiFrameworkChecks.map((item) => item.topic || item.title) },
    { title: "Reminder Task", items: reminderTasks.map((item) => `${item.triggerTime || "시간 미정"} · ${item.title}`) },
    { title: "Evidence Log", items: evidenceLogs.map((item) => item.title) },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">선택 날짜 자동화 로그</h2>
          <p className="mt-1 text-sm text-slate-500">
            Import로 분류된 Brief, A/B, Framework, Reminder, Evidence 기록입니다.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {groups.map((group) => (
          <div key={group.title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">{group.title}</div>
            <div className="mt-2 space-y-2">
              {group.items.length > 0 ? (
                group.items.slice(0, 3).map((item) => (
                  <div key={item} className="rounded bg-white p-2 text-xs leading-5 text-slate-700">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">없음</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
