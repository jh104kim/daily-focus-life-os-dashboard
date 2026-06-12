"use client";

import { useState } from "react";
import type {
  BulkAutomationImportPreview,
  JsonFileDiff,
  SelectedImportChange,
  SelectedImportSummary,
} from "@/lib/types";
import { BulkImportPreview } from "./bulk-import-preview";

const placeholder = `# Oflow Morning Brief - 2026-06-12
오늘의 핵심 목표:
- 오늘 핵심 일정과 자동화 우선순위를 정리한다.

# AI Education Focus Dashboard - 2026-06-12
## 오늘의 핵심 목표
- 성능측정 리포트 자동화 평가 기준을 정리한다.

# 저녁 회고 - 2026-06-12
오늘 완료한 것:
- 자동화 워크플로우 초안 작성
내일 가장 먼저 할 일:
- 샘플 데이터로 검증

[Dashboard Import Hint]
automationType: evening_reflection
targetDate: 2026-06-12
primaryJson: reflections.json
relatedJson: evidence-logs.json`;

interface BulkAutomationImportConsoleProps {
  onSaved?: (targetDate: string) => void;
}

export function BulkAutomationImportConsole({ onSaved }: BulkAutomationImportConsoleProps) {
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState<BulkAutomationImportPreview | null>(null);
  const [diff, setDiff] = useState<JsonFileDiff[]>([]);
  const [appliedDiff, setAppliedDiff] = useState<JsonFileDiff[]>([]);
  const [selectedChanges, setSelectedChanges] = useState<SelectedImportChange[]>([]);
  const [selectionDirty, setSelectionDirty] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SelectedImportSummary | null>(null);
  const [backupPath, setBackupPath] = useState("");
  const [importLogId, setImportLogId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePreview() {
    await submit("dryRun");
  }

  async function handleSave() {
    await submit("save");
  }

  async function submit(mode: "dryRun" | "save") {
    setBusy(true);
    setMessage("");
    if (mode === "dryRun") {
      setAppliedDiff([]);
      setBackupPath("");
      setImportLogId("");
      setSelectedSummary(null);
      setSelectionDirty(false);
    }

    try {
      const response = await fetch("/api/bulk-automation-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pastedText,
          mode,
          selectedChanges: mode === "save" && selectionDirty ? selectedChanges : undefined,
        }),
      });
      const result = (await response.json()) as BulkImportResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Bulk Import 실패");
      }

      setPreview(result.preview ?? null);
      setDiff(result.diff ?? []);
      setAppliedDiff(result.appliedDiff ?? []);
      setBackupPath(result.backupPath ?? "");
      setImportLogId(result.importLogId ?? "");
      setSelectedSummary(result.selectedSummary ?? null);

      if (mode === "dryRun") {
        setSelectedChanges(buildAllSelectedChanges(result.diff ?? []));
      } else {
        onSaved?.(result.preview?.blocks[0]?.targetDate ?? "");
      }

      setMessage(mode === "dryRun" ? "Bulk 미리보기 완료" : "Bulk 저장 완료");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk Import 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="bulk-automation-import" className="text-base font-semibold text-slate-950">
          Bulk Automation Import Console
        </label>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Import, Daily Focus 업데이트, 운영 기록을 구분하지 말고 하루치 자동화 결과를
          모두 붙여넣으세요. block 분리, 유형 감지, Diff, 선택 저장을 한 번에 처리합니다.
        </p>
        <textarea
          id="bulk-automation-import"
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={placeholder}
          className="mt-4 min-h-[560px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={busy || pastedText.trim().length === 0}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || pastedText.trim().length === 0}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "처리 중" : "선택 저장"}
          </button>
          {message ? (
            <span className="text-sm font-medium text-emerald-700">{message}</span>
          ) : null}
        </div>
      </section>
      <BulkImportPreview
        preview={preview}
        diff={diff}
        appliedDiff={appliedDiff}
        selectedChanges={selectedChanges}
        selectedSummary={selectedSummary}
        backupPath={backupPath}
        importLogId={importLogId}
        onSelectionChange={(next) => {
          setSelectedChanges(next);
          setSelectionDirty(true);
        }}
      />
    </div>
  );
}

interface BulkImportResponse {
  success: boolean;
  preview?: BulkAutomationImportPreview;
  diff?: JsonFileDiff[];
  appliedDiff?: JsonFileDiff[];
  selectedSummary?: SelectedImportSummary;
  backupPath?: string;
  importLogId?: string;
  message: string;
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
