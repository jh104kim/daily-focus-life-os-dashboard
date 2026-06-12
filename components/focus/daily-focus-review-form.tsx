"use client";

import { useState } from "react";
import type { DailyFocusPlan, Status } from "@/lib/types";

interface DailyFocusReviewFormProps {
  focus: DailyFocusPlan | undefined;
  onSaved?: (focus: DailyFocusPlan) => void;
}

export function DailyFocusReviewForm({ focus, onSaved }: DailyFocusReviewFormProps) {
  if (!focus) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-slate-950">Daily Focus 검토</h2>
        <p className="mt-2 text-sm text-slate-600">
          선택한 날짜에 Daily Focus가 없습니다. Import로 새 계획을 저장하세요.
        </p>
      </section>
    );
  }

  return <DailyFocusReviewEditor key={focus.id} focus={focus} onSaved={onSaved} />;
}

function DailyFocusReviewEditor({
  focus,
  onSaved,
}: {
  focus: DailyFocusPlan;
  onSaved?: (focus: DailyFocusPlan) => void;
}) {
  const [reviewNotes, setReviewNotes] = useState(focus.reviewNotes ?? "");
  const [subGoalStatuses, setSubGoalStatuses] = useState<boolean[]>(
    focus.subGoalStatuses ?? focus.subGoals.map(() => false),
  );
  const [firstActionDone, setFirstActionDone] = useState(focus.firstActionDone ?? false);
  const [completionChecked, setCompletionChecked] = useState(focus.completionChecked ?? false);
  const [actualOutput, setActualOutput] = useState(focus.actualOutput ?? "");
  const [mustNotMissChecked, setMustNotMissChecked] = useState(
    focus.mustNotMissChecked ?? false,
  );
  const [progress, setProgress] = useState(focus.progress);
  const [status, setStatus] = useState<Status>(focus.status);
  const [blockedReason, setBlockedReason] = useState(focus.blockedReason ?? "");
  const [nextAction, setNextAction] = useState(focus.nextAction ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/daily-focus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: focus.id,
          reviewNotes,
          subGoalStatuses,
          firstActionDone,
          completionChecked,
          actualOutput,
          mustNotMissChecked,
          progress,
          status,
          blockedReason,
          nextAction,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        item?: DailyFocusPlan;
        message?: string;
      };

      if (!response.ok || !result.success || !result.item) {
        throw new Error(result.message || "저장 실패");
      }

      setMessage("저장 완료");
      onSaved?.(result.item);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Daily Focus 검토/업데이트</h2>
          <p className="mt-1 text-sm text-slate-600">
            진행률, 상태, 실행 체크, 막힌 점, 다음 행동을 저장합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "저장 중" : "검토 저장"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">핵심 목표 검토 메모</span>
          <textarea
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            className="min-h-24 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">실제 산출물</span>
          <textarea
            value={actualOutput}
            onChange={(event) => setActualOutput(event.target.value)}
            className="min-h-24 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-500">서브 목표 완료 체크</div>
          <div className="mt-3 space-y-2">
            {focus.subGoals.map((goal, index) => (
              <label key={goal} className="flex gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={subGoalStatuses[index] ?? false}
                  onChange={(event) => {
                    const next = [...subGoalStatuses];
                    next[index] = event.target.checked;
                    setSubGoalStatuses(next);
                  }}
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-500">실행 체크</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            <CheckboxLabel
              label="오늘 첫 행동 완료"
              checked={firstActionDone}
              onChange={setFirstActionDone}
            />
            <CheckboxLabel
              label="완료 기준 충족"
              checked={completionChecked}
              onChange={setCompletionChecked}
            />
            <CheckboxLabel
              label="놓치면 안 되는 것 확인"
              checked={mustNotMissChecked}
              onChange={setMustNotMissChecked}
            />
          </div>
        </div>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">진행률: {progress}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">상태</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Status)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="planned">planned</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
            <option value="blocked">blocked</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">막힌 점</span>
          <input
            value={blockedReason}
            onChange={(event) => setBlockedReason(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">다음 행동</span>
          <input
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </label>
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
    </section>
  );
}

function CheckboxLabel({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
