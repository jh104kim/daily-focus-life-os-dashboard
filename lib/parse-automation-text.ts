import type { ParsedAutomationImport } from "./types";

export function parseAutomationText(text: string): ParsedAutomationImport {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const title = normalized.split("\n").find((line) => line.startsWith("# ")) ?? "";
  const date = extractDate(normalized) ?? getTodayDate();
  const sections = extractSections(normalized);

  const coreGoalSection = getSection(sections, "오늘의 핵심 목표");
  const moduleSection = getSection(sections, "오늘의 학습/실행 모듈");
  const kpiSection = getSection(sections, "KPI Card 형식 요약");
  const aiAxSection = getSection(sections, "AI/AX 적용 관점");
  const firstActionSection = getSection(sections, "오늘 첫 행동");

  const coreGoal = firstMeaningfulLine(coreGoalSection) || "오늘 핵심 목표 미입력";
  const learningModuleTitle =
    firstMeaningfulLine(moduleSection) || inferModuleFromSkills(aiAxSection);

  return {
    date,
    coreGoal,
    learningModuleTitle,
    progressGoal: extractProgress(extractKeyValue(kpiSection, "오늘의 진행률 목표")),
    completionCriteria:
      extractKeyValue(kpiSection, "완료 기준") || "완료 기준 미입력",
    remainingTasks: extractKeyValue(kpiSection, "남은 과제") || "남은 과제 미입력",
    expectedOutput: extractKeyValue(kpiSection, "예상 산출물") || "예상 산출물 미입력",
    businessProblem:
      extractKeyValue(aiAxSection, "내 업무 문제") || "업무 문제 미입력",
    aiTransformedForm:
      extractKeyValue(aiAxSection, "AI로 바꿀 수 있는 형태") ||
      "AI 전환 형태 미입력",
    requiredSkills: extractListValue(aiAxSection, "필요한 기술"),
    expectedEffect:
      extractKeyValue(aiAxSection, "예상 자동화 효과") || "예상 효과 미입력",
    firstAction: firstMeaningfulLine(firstActionSection) || "오늘 첫 행동 미입력",
    sourceTitle: title.replace(/^#\s*/, "") || `AI Education Focus Dashboard - ${date}`,
  };
}

function extractDate(text: string): string | undefined {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
}

function extractSections(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const sectionRegex = /^##\s+\d+\.\s+(.+)$/gm;
  const matches = [...text.matchAll(sectionRegex)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    result[title] = text.slice(start, end).trim();
  }

  return result;
}

function getSection(sections: Record<string, string>, keyword: string): string {
  const matchedKey = Object.keys(sections).find((key) => key.includes(keyword));
  return matchedKey ? sections[matchedKey] : "";
}

function firstMeaningfulLine(section: string): string {
  return (
    section
      .split("\n")
      .map(cleanLine)
      .find((line) => line.length > 0 && !line.endsWith(":")) ?? ""
  );
}

function extractKeyValue(section: string, key: string): string {
  const lines = section.split("\n");
  const matched = lines.find((line) => cleanLine(line).startsWith(`${key}:`));

  if (!matched) {
    return "";
  }

  return cleanLine(matched).replace(`${key}:`, "").trim();
}

function extractListValue(section: string, key: string): string[] {
  const inline = extractKeyValue(section, key);
  if (inline) {
    return splitSkills(inline);
  }

  const lines = section.split("\n");
  const keyIndex = lines.findIndex((line) => cleanLine(line).startsWith(`${key}:`));
  if (keyIndex === -1) {
    return [];
  }

  const values: string[] = [];
  for (const line of lines.slice(keyIndex + 1)) {
    const cleaned = cleanLine(line);
    if (!cleaned || cleaned.endsWith(":")) {
      break;
    }
    values.push(cleaned);
  }

  return values.length > 0 ? values : ["AI 문제 재정의"];
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

function inferModuleFromSkills(section: string): string {
  const skills = extractListValue(section, "필요한 기술");
  return skills[0] || "AI Essential";
}

function cleanLine(line: string): string {
  return line.replace(/^\s*[-*]\s*/, "").trim();
}

function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
