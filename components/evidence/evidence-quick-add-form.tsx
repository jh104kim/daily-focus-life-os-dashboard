"use client";

import { useState } from "react";
import type { DailyFocusPlan, EvidenceLog, EvidenceType } from "@/lib/types";

interface EvidenceQuickAddFormProps {
  selectedDate: string;
  focus: DailyFocusPlan | undefined;
  evidenceLogs: EvidenceLog[];
  onSaved: (evidence: EvidenceLog) => void;
}

const outputTypes: EvidenceType[] = ["문서", "코드", "대시보드", "회고"];

export function EvidenceQuickAddForm({
  selectedDate,
  focus,
  evidenceLogs,
  onSaved,
}: EvidenceQuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [outputType, setOutputType] = useState<EvidenceType>("문서");
  const [evidenceType, setEvidenceType] = useState("운영 로그");
  const [note, setNote] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [relatedFocusId, setRelatedFocusId] = useState(focus?.id ?? "");
  const [relatedGoalId, setRelatedGoalId] = useState(focus?.relatedGoalId ?? "");
  const [relatedModuleId, setRelatedModuleId] = useState(focus?.relatedModuleId ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/evidence-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate,
          title,
          outputType,
          evidenceType,
          note,
          sourceUrl,
          relatedFocusId,
          relatedGoalId,
          relatedModuleId,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        item?: EvidenceLog;
        message?: string;
      };

      if (!response.ok || !result.success || !result.item) {
        throw new Error(result.message || "산출물 로그 저장 실패");
      }

      setTitle("");
      setNote("");
      setSourceUrl("");
      setMessage("산출물 로그 저장 완료");
      onSaved(result.item);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "산출물 로그 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Evidence Log 빠른 추가</h2>
          <p className="mt-1 text-sm text-slate-600">
            선택 날짜 {selectedDate}의 산출물, 문서, 코드, 회고 링크를 저장합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "저장 중" : "로그 추가"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="title" value={title} onChange={setTitle} />
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">outputType</span>
          <select
            value={outputType}
            onChange={(event) => setOutputType(event.target.value as EvidenceType)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {outputTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <Field label="evidenceType" value={evidenceType} onChange={setEvidenceType} />
        <Field label="sourceUrl" value={sourceUrl} onChange={setSourceUrl} />
        <Field label="relatedFocusId" value={relatedFocusId} onChange={setRelatedFocusId} />
        <Field label="relatedGoalId" value={relatedGoalId} onChange={setRelatedGoalId} />
        <Field label="relatedModuleId" value={relatedModuleId} onChange={setRelatedModuleId} />
        <label className="space-y-2 md:col-span-2">
          <span className="text-xs font-medium text-slate-500">note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-20 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-950">
          선택 날짜 Evidence Log ({evidenceLogs.length})
        </div>
        <div className="mt-3 space-y-2">
          {evidenceLogs.length > 0 ? (
            evidenceLogs.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
              >
                <div className="font-medium text-slate-900">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {item.outputType} · {item.reviewStatus ?? "pending"} ·{" "}
                  {item.sourceUrl ?? item.artifactLink}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              아직 선택 날짜 산출물 로그가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
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
