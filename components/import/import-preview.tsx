import type { ReactNode } from "react";
import type {
  AutomationImportPreview,
  JsonFileDiff,
  JsonFieldChange,
  JsonRecordSummary,
  JsonRecordDiff,
  SelectedImportChange,
} from "@/lib/types";

interface ImportPreviewProps {
  parsed: AutomationImportPreview | null;
  diff: JsonFileDiff[];
  appliedDiff: JsonFileDiff[];
  selectedChanges: SelectedImportChange[];
  onSelectionChange: (changes: SelectedImportChange[]) => void;
}

export function ImportPreview({
  parsed,
  diff,
  appliedDiff,
  selectedChanges,
  onSelectionChange,
}: ImportPreviewProps) {
  if (!parsed) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-slate-950">미리보기</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          자동화 결과를 붙여넣고 미리보기를 누르면 자동화 유형, 저장 대상 JSON,
          누락 필드, 보정 필드와 저장될 데이터가 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600">
          {parsed.targetDate}
        </span>
        <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 font-mono text-xs font-semibold text-cyan-700">
          {parsed.automationType}
        </span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{parsed.sourceTitle}</h2>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <BadgeList title="저장 대상 JSON" tone="cyan" items={parsed.targetFiles} />
        <BadgeList
          title="덮어쓰기 여부"
          tone="slate"
          items={Object.entries(parsed.overwrite).map(
            ([key, value]) => `${key}: ${value ? "업데이트" : "신규"}`,
          )}
        />
        <BadgeList
          title="누락 필드"
          tone="rose"
          items={parsed.missingFields.length > 0 ? parsed.missingFields : ["없음"]}
        />
        <BadgeList
          title="자동 보정 필드"
          tone="amber"
          items={parsed.autoFilledFields.length > 0 ? parsed.autoFilledFields : ["없음"]}
        />
      </div>

      {parsed.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {parsed.warnings.join(" / ")}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <DiffPanel
          title="저장 전 예상 Diff"
          diffs={diff}
          selectable
          selectedChanges={selectedChanges}
          onSelectionChange={onSelectionChange}
        />
        <DiffPanel title="저장 후 적용 Diff" diffs={appliedDiff} />
        <JsonBlock title="dailyFocusPlans 미리보기" value={parsed.dailyFocusPlan} />
        <JsonBlock title="reflections 미리보기" value={parsed.reflection} />
        <JsonBlock title="learningModules 미리보기" value={parsed.learningModule} />
        <JsonBlock title="aiApplications 미리보기" value={parsed.aiApplication} />
        <JsonBlock title="evidenceLogs 미리보기" value={parsed.evidenceLogs} />
        <JsonBlock title="briefLogs 미리보기" value={parsed.briefLog} />
        <JsonBlock title="abTestLogs 미리보기" value={parsed.abTestLog} />
        <JsonBlock title="aiFrameworkChecks 미리보기" value={parsed.aiFrameworkCheck} />
        <JsonBlock title="reminderTasks 미리보기" value={parsed.reminderTask} />
      </div>
    </section>
  );
}

export function DiffPanel({
  title,
  diffs,
  selectable = false,
  selectedChanges = [],
  onSelectionChange,
}: {
  title: string;
  diffs: JsonFileDiff[];
  selectable?: boolean;
  selectedChanges?: SelectedImportChange[];
  onSelectionChange?: (changes: SelectedImportChange[]) => void;
}) {
  if (diffs.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-500">{title}</div>
        <p className="mt-2 text-sm text-slate-500">표시할 변경 사항이 없습니다.</p>
      </div>
    );
  }

  const totalAdded = diffs.reduce((sum, diff) => sum + diff.added.length, 0);
  const totalUpdated = diffs.reduce((sum, diff) => sum + diff.updated.length, 0);
  const totalRemoved = diffs.reduce((sum, diff) => sum + diff.removed.length, 0);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-950">{title}</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge tone="emerald">추가 {totalAdded}</Badge>
          <Badge tone="cyan">수정 {totalUpdated}</Badge>
          <Badge tone={totalRemoved > 0 ? "rose" : "slate"}>삭제 {totalRemoved}</Badge>
        </div>
      </div>
      {selectable && onSelectionChange ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={() => onSelectionChange(buildAllSelectedChanges(diffs))}>
            전체 선택
          </ActionButton>
          <ActionButton onClick={() => onSelectionChange([])}>전체 해제</ActionButton>
          <ActionButton onClick={() => onSelectionChange(buildImportantOnlyChanges(diffs))}>
            중요 필드만 선택
          </ActionButton>
          <ActionButton
            onClick={() =>
              onSelectionChange(
                selectedChanges.filter((change) => normalizeFileName(change.fileName) !== "evidence-logs.json"),
              )
            }
          >
            Evidence 제외
          </ActionButton>
          <ActionButton
            onClick={() =>
              onSelectionChange(
                buildAllSelectedChanges(diffs).filter(
                  (change) => normalizeFileName(change.fileName) === "reflections.json",
                ),
              )
            }
          >
            Reflection만 저장
          </ActionButton>
          <ActionButton
            onClick={() =>
              onSelectionChange(
                buildAllSelectedChanges(diffs).filter(
                  (change) => normalizeFileName(change.fileName) === "daily-focus-plans.json",
                ),
              )
            }
          >
            Daily Focus만 저장
          </ActionButton>
        </div>
      ) : null}
      <div className="mt-3 space-y-3">
        {diffs.map((diff) => (
          <details
            key={diff.fileName}
            open
            className="rounded-md border border-slate-200 bg-slate-50 p-3"
          >
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              {selectable && onSelectionChange ? (
                <input
                  type="checkbox"
                  checked={isFileFullySelected(diff, selectedChanges)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onSelectionChange(
                      toggleFileSelection(diff, selectedChanges, event.target.checked),
                    )
                  }
                  className="mr-2 align-middle"
                />
              ) : null}
              {diff.fileName} · 추가 {diff.added.length} / 수정 {diff.updated.length} /
              삭제 {diff.removed.length}
            </summary>
            {diff.removed.length > 0 ? (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                삭제 예상 항목이 있습니다. 현재 저장 로직은 삭제를 수행하지 않도록 설계되어 있습니다.
              </div>
            ) : null}
            <AddedRecordList
              fileName={diff.fileName}
              records={diff.added}
              selectable={selectable}
              selectedChanges={selectedChanges}
              onSelectionChange={onSelectionChange}
            />
            <div className="mt-3 space-y-3">
              {diff.updated.map((item) => (
                <div key={`${diff.fileName}-${item.id ?? item.title}`} className="rounded-md bg-white p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    {selectable && onSelectionChange ? (
                      <input
                        type="checkbox"
                        checked={isRecordSelected(diff.fileName, "update", item, selectedChanges)}
                        onChange={(event) =>
                          onSelectionChange(
                            toggleUpdateRecordSelection(
                              diff.fileName,
                              item,
                              selectedChanges,
                              event.target.checked,
                            ),
                          )
                        }
                      />
                    ) : null}
                    <span>{item.title ?? item.id ?? "updated record"}</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {item.changedFields.map((change) => (
                      <FieldChangeRow
                        key={change.field}
                        fileName={diff.fileName}
                        record={item}
                        change={change}
                        selectable={selectable}
                        checked={isFieldSelected(diff.fileName, item, change.field, selectedChanges)}
                        onChange={
                          onSelectionChange
                            ? (checked) =>
                                onSelectionChange(
                                  toggleFieldSelection(
                                    diff.fileName,
                                    item,
                                    change.field,
                                    selectedChanges,
                                    checked,
                                  ),
                                )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function AddedRecordList({
  fileName,
  records,
  selectable,
  selectedChanges,
  onSelectionChange,
}: {
  fileName: string;
  records: JsonRecordSummary[];
  selectable: boolean;
  selectedChanges: SelectedImportChange[];
  onSelectionChange?: (changes: SelectedImportChange[]) => void;
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-slate-500">추가될 항목</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {records.map((record) => (
          <label
            key={formatRecord(record)}
            className="flex items-center gap-2 rounded bg-white px-2 py-1 text-xs text-slate-700"
          >
            {selectable && onSelectionChange ? (
              <input
                type="checkbox"
                checked={isRecordSelected(fileName, "add", record, selectedChanges)}
                onChange={(event) =>
                  onSelectionChange(
                    toggleAddRecordSelection(fileName, record, selectedChanges, event.target.checked),
                  )
                }
              />
            ) : null}
            <span>{formatRecord(record)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FieldChangeRow({
  fileName,
  record,
  change,
  selectable,
  checked,
  onChange,
}: {
  fileName: string;
  record: JsonRecordDiff;
  change: JsonFieldChange;
  selectable: boolean;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="grid gap-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs md:grid-cols-[140px_1fr]">
      <div className="flex items-center gap-2 font-mono font-semibold text-slate-700">
        {selectable && onChange ? (
          <input
            type="checkbox"
            aria-label={`${fileName} ${record.id ?? record.title} ${change.field}`}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
        ) : null}
        {change.field}
        {change.important ? <Badge tone="amber">중요</Badge> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <ValueBlock label="before" value={change.before} />
        <ValueBlock label="after" value={change.after} />
      </div>
    </div>
  );
}

function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function ValueBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] font-semibold text-slate-400">{label}</div>
      <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-2 text-[11px] leading-4 text-slate-700">
        {formatValue(value)}
      </pre>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "emerald" | "cyan" | "rose" | "slate" | "amber";
}) {
  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];

  return <span className={`rounded border px-2 py-1 ${toneClass}`}>{children}</span>;
}

function formatRecord(record: { id?: string; title?: string; targetDate?: string }) {
  return [record.title, record.id, record.targetDate].filter(Boolean).join(" · ");
}

function formatValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

function buildAllSelectedChanges(diff: JsonFileDiff[]): SelectedImportChange[] {
  return diff.flatMap((file) => [
    ...file.added.map((record) => toSelectedChange(file.fileName, "add", record)),
    ...file.updated.map((record) => ({
      ...toSelectedChange(file.fileName, "update", record),
      selectedFields: record.changedFields.map((field) => field.field),
    })),
  ]);
}

function buildImportantOnlyChanges(diff: JsonFileDiff[]): SelectedImportChange[] {
  return diff.flatMap((file) =>
    file.updated
      .map((record) => ({
        ...toSelectedChange(file.fileName, "update" as const, record),
        selectedFields: record.changedFields
          .filter((field) => field.important)
          .map((field) => field.field),
      }))
      .filter((change) => change.selectedFields.length > 0),
  );
}

function toggleFileSelection(
  file: JsonFileDiff,
  selectedChanges: SelectedImportChange[],
  checked: boolean,
): SelectedImportChange[] {
  const withoutFile = selectedChanges.filter(
    (change) => normalizeFileName(change.fileName) !== normalizeFileName(file.fileName),
  );
  return checked ? [...withoutFile, ...buildAllSelectedChanges([file])] : withoutFile;
}

function toggleAddRecordSelection(
  fileName: string,
  record: JsonRecordSummary,
  selectedChanges: SelectedImportChange[],
  checked: boolean,
): SelectedImportChange[] {
  const without = removeMatchingChange(fileName, "add", record, selectedChanges);
  return checked ? [...without, toSelectedChange(fileName, "add", record)] : without;
}

function toggleUpdateRecordSelection(
  fileName: string,
  record: JsonRecordDiff,
  selectedChanges: SelectedImportChange[],
  checked: boolean,
): SelectedImportChange[] {
  const without = removeMatchingChange(fileName, "update", record, selectedChanges);
  return checked
    ? [
        ...without,
        {
          ...toSelectedChange(fileName, "update", record),
          selectedFields: record.changedFields.map((field) => field.field),
        },
      ]
    : without;
}

function toggleFieldSelection(
  fileName: string,
  record: JsonRecordDiff,
  field: string,
  selectedChanges: SelectedImportChange[],
  checked: boolean,
): SelectedImportChange[] {
  const existing = findMatchingChange(fileName, "update", record, selectedChanges);
  const without = removeMatchingChange(fileName, "update", record, selectedChanges);
  const currentFields = new Set(existing?.selectedFields ?? []);
  if (checked) {
    currentFields.add(field);
  } else {
    currentFields.delete(field);
  }

  if (currentFields.size === 0) {
    return without;
  }

  return [
    ...without,
    {
      ...toSelectedChange(fileName, "update", record),
      selectedFields: Array.from(currentFields),
    },
  ];
}

function isFileFullySelected(file: JsonFileDiff, selectedChanges: SelectedImportChange[]) {
  return buildAllSelectedChanges([file]).every((change) =>
    Boolean(findMatchingChange(change.fileName, change.action, change, selectedChanges)),
  );
}

function isRecordSelected(
  fileName: string,
  action: "add" | "update",
  record: JsonRecordSummary,
  selectedChanges: SelectedImportChange[],
) {
  const selected = findMatchingChange(fileName, action, record, selectedChanges);
  if (!selected) {
    return false;
  }
  if (action === "update" && "changedFields" in record) {
    return (record as JsonRecordDiff).changedFields.every((field) =>
      selected.selectedFields?.includes(field.field),
    );
  }
  return true;
}

function isFieldSelected(
  fileName: string,
  record: JsonRecordDiff,
  field: string,
  selectedChanges: SelectedImportChange[],
) {
  return Boolean(
    findMatchingChange(fileName, "update", record, selectedChanges)?.selectedFields?.includes(field),
  );
}

function removeMatchingChange(
  fileName: string,
  action: "add" | "update",
  record: JsonRecordSummary,
  selectedChanges: SelectedImportChange[],
) {
  return selectedChanges.filter(
    (change) => !isSameChange(change, fileName, action, record),
  );
}

function findMatchingChange(
  fileName: string,
  action: "add" | "update",
  record: JsonRecordSummary,
  selectedChanges: SelectedImportChange[],
) {
  return selectedChanges.find((change) => isSameChange(change, fileName, action, record));
}

function isSameChange(
  change: SelectedImportChange,
  fileName: string,
  action: "add" | "update",
  record: JsonRecordSummary,
) {
  return (
    normalizeFileName(change.fileName) === normalizeFileName(fileName) &&
    change.action === action &&
    ((record.id && change.id === record.id) ||
      (record.title && change.title === record.title) ||
      (record.targetDate && change.targetDate === record.targetDate))
  );
}

function toSelectedChange(
  fileName: string,
  action: "add" | "update",
  record: JsonRecordSummary,
): SelectedImportChange {
  return {
    fileName,
    action,
    id: record.id,
    title: record.title,
    targetDate: record.targetDate,
  };
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/^data\//, "");
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-950 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-300">{title}</div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function BadgeList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "rose" | "amber" | "cyan" | "slate";
}) {
  const toneClass = {
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="text-xs font-semibold">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(items.length > 0 ? items : ["없음"]).map((item) => (
          <span key={item} className="rounded bg-white/80 px-2 py-1 text-xs">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
