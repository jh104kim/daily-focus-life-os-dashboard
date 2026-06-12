import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDataFilePath, normalizeDataFileName } from "./data-file-map";

export async function readJsonFile<T>(fileName: string): Promise<T[]> {
  const text = await readFile(getDataFilePath(fileName), "utf8");
  return JSON.parse(text) as T[];
}

export async function writeJsonFile<T>(
  fileName: string,
  data: T[],
): Promise<void> {
  await writeFile(getDataFilePath(fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function backupJsonFiles(
  fileNames: string[],
): Promise<{ backupPath: string; backedUpFiles: string[] }> {
  const stamp = formatBackupStamp(new Date());
  const backupPath = `data/backups/${stamp}`;
  const backupDir = path.join(process.cwd(), "data", "backups", stamp);
  const uniqueFileNames = Array.from(
    new Set(fileNames.map((fileName) => normalizeDataFileName(fileName))),
  );

  await mkdir(backupDir, { recursive: true });
  await Promise.all(
    uniqueFileNames.map((fileName) =>
      copyFile(getDataFilePath(fileName), path.join(backupDir, fileName)),
    ),
  );

  return { backupPath, backedUpFiles: uniqueFileNames.map((fileName) => `data/${fileName}`) };
}

export function upsertJsonRecord<T>(
  items: T[],
  record: T,
  keyResolver: (item: T) => string | Array<string | undefined> | undefined,
): T[] {
  const recordKeys = new Set(normalizeKeys(keyResolver(record)));
  const index = items.findIndex((item) =>
    normalizeKeys(keyResolver(item)).some((key) => recordKeys.has(key)),
  );

  if (index < 0) {
    return appendJsonRecord(items, record);
  }

  const next = [...items];
  next[index] = { ...next[index], ...record };
  return next;
}

export function appendJsonRecord<T>(items: T[], record: T): T[] {
  return [record, ...items];
}

export function updateJsonRecordFields<T extends { id: string }>(
  items: T[],
  id: string,
  fields: Partial<T>,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...fields } : item));
}

function normalizeKeys(keys: string | Array<string | undefined> | undefined): string[] {
  return (Array.isArray(keys) ? keys : [keys]).filter(
    (key): key is string => Boolean(key?.trim()),
  );
}

function formatBackupStamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}-${get("hour")}${get("minute")}`;
}
