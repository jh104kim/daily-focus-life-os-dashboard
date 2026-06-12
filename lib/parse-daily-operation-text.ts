import type {
  DailyFocusPlan,
  EvidenceLogCreateInput,
  EvidenceType,
  ParsedDailyOperationImport,
  Reflection,
  ReflectionUpsertInput,
} from "./types";

const reflectionLabels = {
  completed: ["오늘 완료한 것", "완료한 것", "오늘 한 일", "done", "completed"],
  misses: ["아쉬웠던 점/막힌 점", "아쉬웠던 점", "막힌 점", "블로커", "blocked"],
  tomorrowFirstAction: [
    "내일 가장 먼저 할 일",
    "내일 첫 행동",
    "tomorrow first action",
  ],
  tomorrowGoalDraft: [
    "내일 핵심 목표 초안",
    "내일 목표 초안",
    "tomorrow goal draft",
  ],
  learnings: ["오늘 배운 것", "배운 것", "학습 내용", "learnings"],
  applicationPoints: [
    "내 업무에 적용할 지점",
    "업무 적용 지점",
    "적용할 지점",
    "applied to work",
  ],
};

const evidenceLabels = [
  "evidence log",
  "evidence",
  "산출물 로그",
  "오늘 만든 산출물",
  "산출물",
  "output log",
];

const allLabels = [
  ...Object.values(reflectionLabels).flat(),
  ...evidenceLabels,
  "title",
  "outputType",
  "evidenceType",
  "note",
  "sourceUrl",
  "link",
  "링크",
  "메모",
];

export function parseDailyOperationText({
  pastedText,
  selectedDate,
  focus,
  existingReflection,
}: {
  pastedText: string;
  selectedDate: string;
  focus?: DailyFocusPlan;
  existingReflection?: Reflection;
}): ParsedDailyOperationImport {
  const date = extractDate(pastedText) ?? selectedDate;
  const completed = toLines(findSection(pastedText, reflectionLabels.completed));
  const misses = toLines(findSection(pastedText, reflectionLabels.misses));
  const learnings = toLines(findSection(pastedText, reflectionLabels.learnings));
  const applicationPoints = toLines(
    findSection(pastedText, reflectionLabels.applicationPoints),
  );
  const tomorrowFirstAction = firstLine(
    findSection(pastedText, reflectionLabels.tomorrowFirstAction),
  );
  const tomorrowGoalDraft = firstLine(
    findSection(pastedText, reflectionLabels.tomorrowGoalDraft),
  );

  const reflection: ReflectionUpsertInput = {
    id: existingReflection?.id,
    selectedDate: date,
    relatedFocusId: focus?.id ?? existingReflection?.relatedFocusId,
    relatedGoalId: focus?.relatedGoalId ?? existingReflection?.relatedGoalId,
    relatedModuleId: focus?.relatedModuleId ?? existingReflection?.relatedModuleId,
    completed:
      completed.length > 0
        ? completed
        : existingReflection?.completed ?? ["오늘 완료한 내용을 입력하지 않았습니다."],
    misses,
    tomorrowFirstAction:
      tomorrowFirstAction || focus?.nextAction || existingReflection?.tomorrowFirstAction || "",
    tomorrowGoalDraft: tomorrowGoalDraft || existingReflection?.tomorrowGoalDraft || "",
    learnings,
    applicationPoints,
  };

  const evidenceLogs = parseEvidenceLogs(pastedText, date, focus);
  const missingFields = [
    completed.length === 0 ? "오늘 완료한 것" : "",
    reflection.tomorrowFirstAction ? "" : "내일 가장 먼저 할 일",
    evidenceLogs.length > 0 ? "" : "Evidence Log",
  ].filter(Boolean);
  const autoFilledFields = [
    extractDate(pastedText) ? "" : "selectedDate",
    completed.length > 0 ? "" : "reflection.completed",
  ].filter(Boolean);

  return {
    selectedDate: date,
    reflection,
    evidenceLogs,
    missingFields,
    autoFilledFields,
    schemaTargets: ["reflections", "evidence_logs"],
    overwrite: {
      reflection: Boolean(existingReflection),
    },
  };
}

function parseEvidenceLogs(
  text: string,
  selectedDate: string,
  focus?: DailyFocusPlan,
): EvidenceLogCreateInput[] {
  const evidenceSection = findSection(text, evidenceLabels);
  const source = evidenceSection || "";
  const structuredGroups = source
    .split(/\n\s*\n/g)
    .map((group) => group.trim())
    .filter(Boolean);

  const logs =
    structuredGroups.length > 1
      ? structuredGroups.map((group) => parseEvidenceGroup(group, selectedDate, focus))
      : toLines(source).map((line) => parseEvidenceLine(line, selectedDate, focus));

  return logs.filter((item) => item.title.trim());
}

function parseEvidenceGroup(
  group: string,
  selectedDate: string,
  focus?: DailyFocusPlan,
): EvidenceLogCreateInput {
  const title =
    firstLine(findSection(group, ["title", "제목", "산출물명"])) ||
    firstMeaningfulLine(group);
  const outputType = inferEvidenceType(
    firstLine(findSection(group, ["outputType", "타입", "유형"])) || group,
  );
  const evidenceType =
    firstLine(findSection(group, ["evidenceType", "분류", "카테고리"])) || outputType;
  const note = firstLine(findSection(group, ["note", "메모", "설명"])) || group;
  const sourceUrl = firstLine(findSection(group, ["sourceUrl", "link", "링크", "url"]));

  return buildEvidenceInput({
    selectedDate,
    title,
    outputType,
    evidenceType,
    note,
    sourceUrl,
    focus,
  });
}

function parseEvidenceLine(
  line: string,
  selectedDate: string,
  focus?: DailyFocusPlan,
): EvidenceLogCreateInput {
  const title = line.replace(/^(문서|코드|대시보드|회고)\s*[:：-]\s*/, "").trim();
  const outputType = inferEvidenceType(line);

  return buildEvidenceInput({
    selectedDate,
    title,
    outputType,
    evidenceType: outputType,
    note: line,
    sourceUrl: extractUrl(line),
    focus,
  });
}

function buildEvidenceInput({
  selectedDate,
  title,
  outputType,
  evidenceType,
  note,
  sourceUrl,
  focus,
}: {
  selectedDate: string;
  title: string;
  outputType: EvidenceType;
  evidenceType: string;
  note: string;
  sourceUrl?: string;
  focus?: DailyFocusPlan;
}): EvidenceLogCreateInput {
  return {
    selectedDate,
    title,
    outputType,
    evidenceType,
    note,
    sourceUrl,
    relatedFocusId: focus?.id,
    relatedGoalId: focus?.relatedGoalId,
    relatedModuleId: focus?.relatedModuleId,
  };
}

function findSection(text: string, labels: string[]): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const startIndex = lines.findIndex((line) => isLabelLine(line, labels));

  if (startIndex === -1) {
    return "";
  }

  const firstLineValue = stripLabel(lines[startIndex]);
  const sectionLines = firstLineValue ? [firstLineValue] : [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (isLabelLine(lines[index], allLabels)) {
      break;
    }
    sectionLines.push(lines[index]);
  }

  return sectionLines.join("\n").trim();
}

function isLabelLine(line: string, labels: string[]): boolean {
  const normalizedLine = normalizeLabel(line);
  return labels.some((label) => {
    const normalizedLabel = normalizeLabel(label);
    return (
      normalizedLine === normalizedLabel ||
      normalizedLine.startsWith(`${normalizedLabel}:`) ||
      normalizedLine.startsWith(`${normalizedLabel}-`) ||
      normalizedLine.startsWith(`${normalizedLabel} `)
    );
  });
}

function stripLabel(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^[0-9]+[.)]\s*/, "")
    .replace(/^([^:：]+)[:：]\s*/, "")
    .trim();
}

function normalizeLabel(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^[0-9]+[.)]\s*/, "")
    .trim()
    .toLowerCase();
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*]\s*/, "")
        .replace(/^[0-9]+[.)]\s*/, "")
        .trim(),
    )
    .filter(Boolean);
}

function firstLine(value: string): string {
  return toLines(value)[0] ?? "";
}

function firstMeaningfulLine(value: string): string {
  return toLines(value)[0] ?? "";
}

function extractDate(text: string): string | undefined {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
}

function extractUrl(text: string): string | undefined {
  return text.match(/https?:\/\/\S+/)?.[0];
}

function inferEvidenceType(value: string): EvidenceType {
  if (/코드|code|github|tsx|ts|js/i.test(value)) {
    return "코드";
  }
  if (/대시보드|dashboard|화면|ui/i.test(value)) {
    return "대시보드";
  }
  if (/회고|reflection|retro/i.test(value)) {
    return "회고";
  }
  return "문서";
}
