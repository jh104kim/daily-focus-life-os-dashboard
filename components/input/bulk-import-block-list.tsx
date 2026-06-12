import type { BulkAutomationImportPreview } from "@/lib/types";

export function BulkImportBlockList({
  preview,
}: {
  preview: BulkAutomationImportPreview | null;
}) {
  if (!preview) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">자동화 블록 분리 결과</h2>
          <p className="mt-1 text-sm text-slate-500">
            {preview.detectedBlockCount}개 감지 · {preview.parsedBlockCount}개 파싱 ·{" "}
            {preview.unknownBlockCount}개 분류 실패
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
          {preview.importBatchId}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {preview.blocks.map((block) => (
          <div
            key={block.importBlockId}
            className={`rounded-md border p-3 ${
              block.success ? "border-slate-200 bg-slate-50" : "border-rose-200 bg-rose-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-white px-2 py-1 font-mono text-xs">
                {block.automationType}
              </span>
              <span className="rounded bg-white px-2 py-1 font-mono text-xs">
                {block.targetDate}
              </span>
            </div>
            <div className="mt-2 text-sm font-medium text-slate-800">{block.sourceTitle}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {block.targetFiles.length > 0 ? (
                block.targetFiles.map((file) => (
                  <span key={file} className="rounded bg-white px-2 py-1 text-xs text-slate-600">
                    {file}
                  </span>
                ))
              ) : (
                <span className="text-xs text-rose-600">저장 대상 없음</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
