import type { ParsedAutomationImport } from "./types";

type SectionMap = Record<string, string>;

const aliases = {
  coreGoal: [
    "오늘의 핵심 목표",
    "오늘 핵심 목표",
    "핵심 목표",
    "오늘 가장 중요한 목표",
  ],
  module: [
    "오늘의 학습/실행 모듈",
    "학습/실행 모듈",
    "학습 모듈",
    "실행 모듈",
    "오늘의 모듈",
  ],
  kpi: ["KPI Card 형식 요약", "KPI 요약", "KPI", "요약"],
  aiAx: ["AI/AX 적용 관점", "AI/AX 적용", "AI 적용 관점", "AX 적용 관점"],
  progress: ["오늘의 진행률 목표", "진행률 목표", "오늘 진행률", "진행률"],
  completion: ["완료 기준", "완료/미완료 판단", "오늘 완료 조건"],
  remaining: ["남은 과제", "남은 할 일", "남은 작업"],
  output: ["예상 산출물", "산출물", "오늘 산출물"],
  businessProblem: ["내 업무 문제", "업무 문제", "문제"],
  aiForm: [
    "AI로 바꿀 수 있는 형태",
    "AI로 해결 가능한 형태",
    "AI 해결 형태",
    "AI 전환 형태",
  ],
  skills: ["필요한 기술", "필요 기술", "학습할 기술", "필요 역량"],
  effect: ["예상 자동화 효과", "자동화 효과", "예상 효과"],
  firstAction: ["오늘 첫 행동", "오늘 가장 먼저 할 일", "첫 실행 행동", "가장 먼저 할 일"],
} as const;

export function parseAutomationText(text: string): ParsedAutomationImport {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const title = normalized.split("\n").find((line) => line.startsWith("# ")) ?? "";
  const extractedDate = extractDate(normalized);
  const date = extractedDate ?? getTodayDate();
  const sections = extractSections(normalized);

  const coreGoalRaw = firstMeaningfulLine(getSectionByAliases(sections, aliases.coreGoal));
  const moduleRaw = firstMeaningfulLine(getSectionByAliases(sections, aliases.module));
  const kpiSection = getSectionByAliases(sections, aliases.kpi);
  const aiAxSection = getSectionByAliases(sections, aliases.aiAx) || normalized;
  const firstActionRaw = firstMeaningfulLine(
    getSectionByAliases(sections, aliases.firstAction),
  );

  const progressRaw = extractValue(normalized, kpiSection, aliases.progress);
  const skillsRaw = extractListValue(normalized, aiAxSection, aliases.skills);
  const missingFields: string[] = [];
  const autoFilledFields: string[] = [];

  const coreGoal = withFallback(
    coreGoalRaw || extractValue(normalized, normalized, aliases.coreGoal),
    "오늘 핵심 목표 미입력",
    "오늘의 핵심 목표",
    missingFields,
    autoFilledFields,
  );
  const completionCriteria = withFallback(
    extractValue(normalized, kpiSection || normalized, aliases.completion),
    "완료 기준 미입력",
    "완료 기준",
    missingFields,
    autoFilledFields,
  );
  const firstAction = withFallback(
    firstActionRaw || extractValue(normalized, normalized, aliases.firstAction),
    "오늘 첫 행동 미입력",
    "오늘 첫 행동",
    missingFields,
    autoFilledFields,
  );
  const businessProblem = withFallback(
    extractValue(normalized, aiAxSection, aliases.businessProblem),
    "업무 문제 미입력",
    "내 업무 문제",
    missingFields,
    autoFilledFields,
  );

  if (!extractedDate) {
    missingFields.push("날짜");
    autoFilledFields.push(`날짜: ${date}`);
  }

  if (!progressRaw) {
    autoFilledFields.push("progress: 30");
  }

  if (skillsRaw.length === 0) {
    missingFields.push("필요한 기술");
    autoFilledFields.push("필요한 기술: AI 문제 재정의");
  }

  const learningModuleTitle =
    moduleRaw ||
    extractValue(normalized, normalized, aliases.module) ||
    skillsRaw[0] ||
    "AI Essential";

  return {
    date,
    usedFallbackDate: !extractedDate,
    coreGoal,
    learningModuleTitle,
    progressGoal: extractProgress(progressRaw),
    usedFallbackProgress: !progressRaw,
    completionCriteria,
    remainingTasks:
      extractValue(normalized, kpiSection || normalized, aliases.remaining) ||
      "남은 과제 미입력",
    expectedOutput:
      extractValue(normalized, kpiSection || normalized, aliases.output) ||
      "예상 산출물 미입력",
    businessProblem,
    aiTransformedForm:
      extractValue(normalized, aiAxSection, aliases.aiForm) || "AI 전환 형태 미입력",
    requiredSkills: skillsRaw.length > 0 ? skillsRaw : ["AI 문제 재정의"],
    usedFallbackSkills: skillsRaw.length === 0,
    expectedEffect:
      extractValue(normalized, aiAxSection, aliases.effect) || "예상 효과 미입력",
    firstAction,
    sourceTitle: title.replace(/^#\s*/, "") || `AI Education Focus Dashboard - ${date}`,
    missingFields: unique(missingFields),
    autoFilledFields: unique(autoFilledFields),
    overwrite: {
      dailyFocusPlan: false,
      aiApplication: false,
      evidenceLog: false,
      learningModule: false,
    },
  };
}

export function withOverwriteInfo(
  parsed: ParsedAutomationImport,
  overwrite: ParsedAutomationImport["overwrite"],
): ParsedAutomationImport {
  return {
    ...parsed,
    overwrite,
  };
}

function extractDate(text: string): string | undefined {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
}

function extractSections(text: string): SectionMap {
  const result: SectionMap = {};
  const lines = text.split("\n");
  let currentTitle = "";
  let buffer: string[] = [];

  for (const line of lines) {
    const title = parseSectionTitle(line);
    if (title) {
      if (currentTitle) {
        result[currentTitle] = buffer.join("\n").trim();
      }
      currentTitle = title;
      buffer = [];
    } else if (currentTitle) {
      buffer.push(line);
    }
  }

  if (currentTitle) {
    result[currentTitle] = buffer.join("\n").trim();
  }

  return result;
}

function parseSectionTitle(line: string): string {
  const trimmed = line.trim();
  const markdown = trimmed.match(/^#{2,6}\s+(?:\d+\.\s*)?(.+)$/);
  if (markdown) {
    return markdown[1].trim();
  }

  const plain = trimmed.match(/^(?:\d+\.\s*)?([^:-]{2,40})[:：]\s*$/);
  if (plain) {
    return plain[1].trim();
  }

  return "";
}

function getSectionByAliases(sections: SectionMap, aliasList: readonly string[]): string {
  const matchedKey = Object.keys(sections).find((key) =>
    aliasList.some((alias) => normalize(key).includes(normalize(alias))),
  );

  return matchedKey ? sections[matchedKey] : "";
}

function extractValue(
  fullText: string,
  section: string,
  aliasList: readonly string[],
): string {
  return extractKeyValue(section, aliasList) || extractKeyValue(fullText, aliasList);
}

function extractKeyValue(text: string, aliasList: readonly string[]): string {
  const lines = text.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const cleaned = cleanLine(lines[index]);
    const alias = aliasList.find((item) => startsWithAlias(cleaned, item));
    if (!alias) {
      continue;
    }

    const inline = cleaned
      .replace(new RegExp(`^${escapeRegExp(alias)}\\s*[:：]?\\s*`), "")
      .trim();
    if (inline) {
      return inline;
    }

    return collectFollowingValue(lines.slice(index + 1));
  }

  return "";
}

function extractListValue(
  fullText: string,
  section: string,
  aliasList: readonly string[],
): string[] {
  const inline = extractValue(fullText, section, aliasList);
  if (!inline) {
    return [];
  }

  return splitSkills(inline);
}

function collectFollowingValue(lines: string[]): string {
  const values: string[] = [];

  for (const line of lines) {
    const cleaned = cleanLine(line);
    if (!cleaned) {
      if (values.length > 0) {
        break;
      }
      continue;
    }
    if (parseSectionTitle(line) || cleaned.endsWith(":")) {
      break;
    }
    values.push(cleaned);
    if (values.length >= 3) {
      break;
    }
  }

  return values.join(" / ");
}

function firstMeaningfulLine(section: string): string {
  return (
    section
      .split("\n")
      .map(cleanLine)
      .find((line) => line.length > 0 && !line.endsWith(":")) ?? ""
  );
}

function extractProgress(value: string): number {
  const matched = value.match(/\d+/)?.[0];
  if (!matched) {
    return 30;
  }

  return Math.min(100, Math.max(0, Number(matched)));
}

function splitSkills(value: string): string[] {
  return value
    .split(/[,/·|]/)
    .map((item) => cleanLine(item))
    .filter(Boolean);
}

function withFallback(
  value: string,
  fallback: string,
  fieldName: string,
  missingFields: string[],
  autoFilledFields: string[],
): string {
  if (value) {
    return value;
  }

  missingFields.push(fieldName);
  autoFilledFields.push(`${fieldName}: ${fallback}`);
  return fallback;
}

function startsWithAlias(line: string, alias: string): boolean {
  const normalizedLine = normalize(line);
  const normalizedAlias = normalize(alias);
  return (
    normalizedLine.startsWith(`${normalizedAlias}:`) ||
    normalizedLine.startsWith(`${normalizedAlias}：`) ||
    normalizedLine === normalizedAlias ||
    normalizedLine.startsWith(normalizedAlias)
  );
}

function cleanLine(line: string): string {
  return line.replace(/^\s*[-*]\s*/, "").trim();
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
