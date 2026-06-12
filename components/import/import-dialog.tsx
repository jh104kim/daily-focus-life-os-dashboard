"use client";

import { BulkAutomationImportConsole } from "@/components/input/bulk-automation-import-console";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (targetDate: string) => void;
}

export function ImportDialog({ open, onClose, onSaved }: ImportDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-6xl rounded-lg border border-slate-200 bg-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">자동화 결과 Import</h2>
            <p className="mt-1 text-sm text-slate-600">
              여러 자동화 결과를 한 번에 붙여넣고 block별 Diff를 확인한 뒤 선택 저장합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
        <div className="p-5">
          <BulkAutomationImportConsole onSaved={onSaved} />
        </div>
      </div>
    </div>
  );
}
