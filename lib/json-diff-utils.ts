import type { JsonFieldChange, JsonFileDiff, JsonRecordDiff, JsonRecordSummary } from "./types";

type JsonRecord = Record<string, unknown>;

const importantFields = new Set([
  "progress",
  "status",
  "title",
  "targetDate",
  "firstAction",
  "completionCriteria",
  "tomorrowFirstAction",
  "tomorrowGoalDraft",
]);

const ignoredFields = new Set(["createdAt", "updatedAt"]);

export function compareJsonRecords(
  before: JsonRecord | undefined,
  after: JsonRecord | undefined,
): JsonFieldChange[] {
  if (!before || !after) {
    return [];
  }

  const fields = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return fields
    .filter((field) => !ignoredFields.has(field))
    .filter((field) => !isSameValue(before[field], after[field]))
    .map((field) => ({
      field,
      before: before[field],
      after: after[field],
      important: importantFields.has(field),
    }));
}

export function detectAddedRecords<T extends JsonRecord>(
  beforeArray: T[],
  afterArray: T[],
  keyFields: string[],
): JsonRecordSummary[] {
  const beforeKeys = new Set(beforeArray.map((item) => getRecordKey(item, keyFields)));
  return afterArray
    .filter((item) => !beforeKeys.has(getRecordKey(item, keyFields)))
    .map(toSummary);
}

export function detectUpdatedRecords<T extends JsonRecord>(
  beforeArray: T[],
  afterArray: T[],
  keyFields: string[],
): JsonRecordDiff[] {
  const beforeByKey = new Map(beforeArray.map((item) => [getRecordKey(item, keyFields), item]));
  return afterArray
    .map((after) => {
      const before = beforeByKey.get(getRecordKey(after, keyFields));
      const changedFields = compareJsonRecords(before, after);
      return { ...toSummary(after), changedFields };
    })
    .filter((item) => item.changedFields.length > 0);
}

export function detectRemovedRecords<T extends JsonRecord>(
  beforeArray: T[],
  afterArray: T[],
  keyFields: string[],
): JsonRecordSummary[] {
  const afterKeys = new Set(afterArray.map((item) => getRecordKey(item, keyFields)));
  return beforeArray
    .filter((item) => !afterKeys.has(getRecordKey(item, keyFields)))
    .map(toSummary);
}

export function summarizeFieldChanges(
  beforeRecord: JsonRecord,
  afterRecord: JsonRecord,
): JsonFieldChange[] {
  return compareJsonRecords(beforeRecord, afterRecord);
}

export function buildJsonDiff<T extends JsonRecord>(
  fileName: string,
  beforeArray: T[],
  afterArray: T[],
  keyFields: string[],
): JsonFileDiff {
  return {
    fileName,
    added: detectAddedRecords(beforeArray, afterArray, keyFields),
    updated: detectUpdatedRecords(beforeArray, afterArray, keyFields),
    removed: detectRemovedRecords(beforeArray, afterArray, keyFields),
  };
}

function getRecordKey(record: JsonRecord, keyFields: string[]): string {
  const matchedField = keyFields.find((field) => hasKeyGroup(record, field));
  if (!matchedField) {
    return JSON.stringify(record);
  }

  const fields = matchedField.split("|");
  return fields.map((field) => `${field}:${String(record[field])}`).join("|");
}

function hasKeyGroup(record: JsonRecord, fieldGroup: string): boolean {
  return fieldGroup
    .split("|")
    .every((field) => record[field] !== undefined && record[field] !== "");
}

function toSummary(record: JsonRecord): JsonRecordSummary {
  return {
    id: toStringOrUndefined(record.id),
    title: toStringOrUndefined(record.title),
    targetDate: toStringOrUndefined(record.targetDate),
  };
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isSameValue(before: unknown, after: unknown): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
