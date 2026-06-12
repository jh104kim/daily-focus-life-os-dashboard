"use client";

import { useState } from "react";
import type { DailyFocusPlan, Reflection } from "@/lib/types";

interface ReflectionFormProps {
  selectedDate: string;
  reflection: Reflection | undefined;
  focus: DailyFocusPlan | undefined;
  onSaved: (reflection: Reflection) => void;
}

export function ReflectionForm({
  selectedDate,
  reflection,
  focus,
  onSaved,
}: ReflectionFormProps) {
  const [completed, setCompleted] = useState((reflection?.completed ?? []).join("\n"));
  const [misses, setMisses] = useState((reflection?.misses ?? []).join("\n"));
  const [tomorrowFirstAction, setTomorrowFirstAction] = useState(
    reflection?.tomorrowFirstAction ?? focus?.nextAction ?? "",
  );
  const [tomorrowGoalDraft, setTomorrowGoalDraft] = useState(
    reflection?.tomorrowGoalDraft ?? "",
  );
  const [learnings, setLearnings] = useState((reflection?.learnings ?? []).join("\n"));
  const [applicationPoints, setApplicationPoints] = useState(
    (reflection?.applicationPoints ?? reflection?.appliedToWork ?? []).join("\n"),
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reflection?.id,
          selectedDate,
          relatedFocusId: focus?.id ?? reflection?.relatedFocusId,
          relatedGoalId: focus?.relatedGoalId ?? reflection?.relatedGoalId,
          relatedModuleId: focus?.relatedModuleId ?? reflection?.relatedModuleId,
          completed: toLines(completed),
          misses: toLines(misses),
          tomorrowFirstAction,
          tomorrowGoalDraft,
          learnings: toLines(learnings),
          applicationPoints: toLines(applicationPoints),
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        item?: Reflection;
        message?: string;
      };

      if (!response.ok || !result.success || !result.item) {
        throw new Error(result.message || "회고 저장 실패");
      }

      setMessage("회고 저장 완료");
      onSaved(result.item);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "회고 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {reflection ? "Reflection 수정" : "Reflection 입력"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            선택 날짜 {selectedDate}의 저녁 회고를 JSON에 저장합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "저장 중" : "회고 저장"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextAreaField
          label="오늘 완료한 것"
          value={completed}
          onChange={setCompleted}
          placeholder="한 줄에 하나씩 입력"
        />
        <TextAreaField
          label="아쉬웠던 점/막힌 점"
          value={misses}
          onChange={setMisses}
          placeholder="막힌 점, 미완료 이유"
        />
        <TextField
          label="내일 가장 먼저 할 일"
          value={tomorrowFirstAction}
          onChange={setTomorrowFirstAction}
        />
        <TextField
          label="내일 핵심 목표 초안"
          value={tomorrowGoalDraft}
          onChange={setTomorrowGoalDraft}
        />
        <TextAreaField
          label="오늘 배운 것"
          value={learnings}
          onChange={setLearnings}
          placeholder="학습한 개념, 패턴, 기준"
        />
        <TextAreaField
          label="내 업무에 적용할 지점"
          value={applicationPoints}
          onChange={setApplicationPoints}
          placeholder="업무 자동화, FTE 절감, 리포트 개선 지점"
        />
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
