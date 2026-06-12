import { RelatedLink } from "@/components/dashboard/related-link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Reflection } from "@/lib/types";

interface ReflectionCardProps {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  return (
    <article id={reflection.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={reflection.status} />
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
          {reflection.targetDate}
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{reflection.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{reflection.description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ListBlock label="오늘 완료한 것" items={reflection.completed} />
        <ListBlock label="아쉬웠던 점 / 막힌 점" items={reflection.misses} />
        <TextBlock label="내일 가장 먼저 할 일" value={reflection.tomorrowFirstAction} />
        <TextBlock label="내일 핵심 목표 초안" value={reflection.tomorrowGoalDraft} />
        <ListBlock label="오늘 배운 것" items={reflection.learnings} />
        <ListBlock label="내 업무에 적용할 지점" items={reflection.applicationPoints} />
      </div>
      <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="text-xs font-medium text-slate-500">다음 날 자동 입력 후보 필드</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {reflection.autoFillCandidates.map((field) => (
            <span key={field} className="rounded-md bg-white px-2 py-1 font-mono text-xs text-slate-700">
              {field}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-600">
        {reflection.relatedGoalId ? (
          <span>
            관련 목표:{" "}
            <RelatedLink href={`/goals#${reflection.relatedGoalId}`} label={reflection.relatedGoalId} />
          </span>
        ) : null}
      </div>
    </article>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-800">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
