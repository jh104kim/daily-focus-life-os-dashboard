"use client";

import { DiffPanel } from "@/components/import/import-preview";
import type {
  BulkAutomationImportPreview,
  JsonFileDiff,
  SelectedImportChange,
  SelectedImportSummary,
} from "@/lib/types";
import { BulkImportBlockList } from "./bulk-import-block-list";
import { BulkImportSelectedSummary } from "./bulk-import-selected-summary";

export function BulkImportPreview({
  preview,
  diff,
  appliedDiff,
  selectedChanges,
  selectedSummary,
  backupPath,
  importLogId,
  onSelectionChange,
}: {
  preview: BulkAutomationImportPreview | null;
  diff: JsonFileDiff[];
  appliedDiff: JsonFileDiff[];
  selectedChanges: SelectedImportChange[];
  selectedSummary: SelectedImportSummary | null;
  backupPath: string;
  importLogId: string;
  onSelectionChange: (changes: SelectedImportChange[]) => void;
}) {
  if (!preview) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-slate-950">Bulk 미리보기</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          여러 자동화 결과를 붙여넣고 미리보기를 누르면 block 분리, 자동화 유형,
          Diff, 선택 저장 항목이 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <BulkImportBlockList preview={preview} />
      <BulkImportSelectedSummary summary={selectedSummary} />
      {backupPath || importLogId ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {backupPath ? <div>backup: {backupPath}</div> : null}
          {importLogId ? <div>importLogId: {importLogId}</div> : null}
        </div>
      ) : null}
      <DiffPanel
        title="Bulk 저장 전 예상 Diff"
        diffs={diff}
        selectable
        selectedChanges={selectedChanges}
        onSelectionChange={onSelectionChange}
      />
      <DiffPanel title="Bulk 저장 후 적용 Diff" diffs={appliedDiff} />
      {preview.unknownBlocks.length > 0 ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-sm font-semibold text-rose-700">분류 실패 block</h2>
          <div className="mt-3 space-y-2">
            {preview.unknownBlocks.map((block) => (
              <pre
                key={block.importBlockId}
                className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-rose-700"
              >
                {block.rawText}
              </pre>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
