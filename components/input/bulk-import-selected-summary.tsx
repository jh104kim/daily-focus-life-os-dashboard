import type { SelectedImportSummary } from "@/lib/types";

export function BulkImportSelectedSummary({
  summary,
}: {
  summary: SelectedImportSummary | null;
}) {
  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
      <div className="font-semibold">
        {summary.selectedSave ? "선택 저장" : "전체 저장"} 결과 요약
      </div>
      <div className="mt-2 grid gap-1 font-mono text-xs md:grid-cols-4">
        <span>files: {summary.savedFileCount}</span>
        <span>records: {summary.savedRecordCount}</span>
        <span>fields: {summary.savedFieldCount}</span>
        <span>excluded: {summary.excludedRecordCount}</span>
      </div>
    </div>
  );
}
