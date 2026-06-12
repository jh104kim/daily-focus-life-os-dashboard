"use client";

import { useState } from "react";
import type {
  AutomationImportPreview,
  JsonFileDiff,
  SelectedImportChange,
  SelectedImportSummary,
} from "@/lib/types";
import { ImportPreview } from "./import-preview";

const placeholder = `# AI Education Focus Dashboard - 2026-06-12

## 1. 오늘의 핵심 목표
- 구매 사양서 AI 검토 체크리스트 작성

## 2. 오늘의 학습/실행 모듈
- AI Essential

## 3. KPI Card 형식 요약
- 오늘의 진행률 목표: 60%
- 완료 기준: 검토 기준과 승인 필요 항목 분리
- 남은 과제: 샘플 사양서 3건 검증
- 예상 산출물: 구매 사양서 AI 검토 템플릿

## 4. AI/AX 적용 관점
- 내 업무 문제: 발주 전 사양 검토가 사람 기억에 의존한다.
- AI로 바꿀 수 있는 형태: 사양서를 체크리스트와 비교해 누락 조건을 구조화한다.
- 필요한 기술: 프롬프트 설계, 문서 분류, JSON 스키마
- 예상 자동화 효과: 검토 초안 작성 시간을 50% 줄인다.

## 5. 오늘 첫 행동
- 최근 사양서 3건에서 반복 검토 항목을 추출한다.

[Dashboard Import Hint]
automationType: ai_education_focus
targetDate: 2026-06-12
primaryJson: daily-focus-plans.json
relatedJson: learning-modules.json, ai-applications.json, evidence-logs.json`;

interface AutomationImportFormProps {
  onSaved?: (parsed: AutomationImportPreview) => void;
}

export function AutomationImportForm({ onSaved }: AutomationImportFormProps) {
  const [pastedText, setPastedText] = useState("");
  const [parsed, setParsed] = useState<AutomationImportPreview | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFiles, setUpdatedFiles] = useState<string[]>([]);
  const [diff, setDiff] = useState<JsonFileDiff[]>([]);
  const [appliedDiff, setAppliedDiff] = useState<JsonFileDiff[]>([]);
  const [backupPath, setBackupPath] = useState("");
  const [importLogId, setImportLogId] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<SelectedImportChange[]>([]);
  const [selectionDirty, setSelectionDirty] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SelectedImportSummary | null>(null);

  async function handlePreview() {
    try {
      setMessage("");
      setUpdatedFiles([]);
      setAppliedDiff([]);
      setBackupPath("");
      setImportLogId("");
      setSelectionDirty(false);
      setSelectedSummary(null);
      const response = await fetch("/api/automation-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastedText, dryRun: true }),
      });
      const result = (await response.json()) as UnifiedImportResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "미리보기 실패");
      }

      setParsed(result.parsed ?? null);
      setDiff(result.diff ?? []);
      setSelectedChanges(buildAllSelectedChanges(result.diff ?? []));
      setMessage("미리보기 완료");
    } catch (error) {
      setParsed(null);
      setMessage(error instanceof Error ? error.message : "미리보기 파싱 실패");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setUpdatedFiles([]);
    setAppliedDiff([]);
    setBackupPath("");
    setImportLogId("");
    setSelectedSummary(null);

    try {
      const response = await fetch("/api/automation-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pastedText,
          selectedChanges: selectionDirty ? selectedChanges : undefined,
        }),
      });
      const result = (await response.json()) as UnifiedImportResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "저장 실패");
      }

      setParsed(result.parsed ?? null);
      setDiff(result.diff ?? []);
      setAppliedDiff(result.appliedDiff ?? []);
      setUpdatedFiles(result.updatedFiles ?? []);
      setBackupPath(result.backupPath ?? "");
      setImportLogId(result.importLogId ?? "");
      setSelectedSummary(result.selectedSummary ?? null);
      setMessage("저장 완료");
      if (result.parsed) {
        onSaved?.(result.parsed);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 실패");
    } finally {
      setIsSaving(false);
    }
  }

  const canAct = pastedText.trim().length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="automation-import" className="text-base font-semibold text-slate-950">
          자동화 결과 붙여넣기
        </label>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          ChatGPT 자동화 결과 전체를 그대로 붙여넣고 미리보기로 파싱 결과를 확인한 뒤
          저장하세요.
        </p>
        <textarea
          id="automation-import"
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={placeholder}
          className="mt-4 min-h-[520px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!canAct}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canAct || isSaving}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "저장 중" : "저장"}
          </button>
          {message ? (
            <span
              className={`text-sm font-medium ${
                message === "저장 완료" || message === "미리보기 완료"
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              {message}
            </span>
          ) : null}
        </div>
        {updatedFiles.length > 0 ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs font-medium text-emerald-700">업데이트된 파일</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {updatedFiles.map((file) => (
                <span key={file} className="rounded bg-white px-2 py-1 font-mono text-xs text-emerald-800">
                  {file}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {backupPath || importLogId ? (
          <div className="mt-4 rounded-md border border-cyan-200 bg-cyan-50 p-3">
            <div className="text-xs font-medium text-cyan-700">저장 후 결과</div>
            <div className="mt-2 grid gap-1 font-mono text-xs text-cyan-800">
              {backupPath ? <span>backup: {backupPath}</span> : null}
              {importLogId ? <span>importLogId: {importLogId}</span> : null}
              {selectedSummary ? (
                <span>
                  selectedSave: {selectedSummary.selectedSave ? "true" : "false"} · records:{" "}
                  {selectedSummary.savedRecordCount} · fields: {selectedSummary.savedFieldCount} ·
                  excluded: {selectedSummary.excludedRecordCount}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
      <ImportPreview
        parsed={parsed}
        diff={diff}
        appliedDiff={appliedDiff}
        selectedChanges={selectedChanges}
        onSelectionChange={(next) => {
          setSelectedChanges(next);
          setSelectionDirty(true);
        }}
      />
    </div>
  );
}

interface UnifiedImportResponse {
  success: boolean;
  parsed?: AutomationImportPreview;
  diff?: JsonFileDiff[];
  appliedDiff?: JsonFileDiff[];
  updatedFiles?: string[];
  backupPath?: string;
  importLogId?: string;
  selectedSummary?: SelectedImportSummary;
  message: string;
  warnings?: string[];
}

function buildAllSelectedChanges(diff: JsonFileDiff[]): SelectedImportChange[] {
  return diff.flatMap((file) => [
    ...file.added.map((record) => ({
      fileName: file.fileName,
      action: "add" as const,
      id: record.id,
      title: record.title,
      targetDate: record.targetDate,
    })),
    ...file.updated.map((record) => ({
      fileName: file.fileName,
      action: "update" as const,
      id: record.id,
      title: record.title,
      targetDate: record.targetDate,
      selectedFields: record.changedFields.map((field) => field.field),
    })),
  ]);
}
