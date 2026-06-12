"use client";

import { useState } from "react";
import { parseAutomationText } from "@/lib/parse-automation-text";
import type { ImportDailyFocusResponse, ParsedAutomationImport } from "@/lib/types";
import { ImportPreview } from "./import-preview";

const placeholder = `# AI Education Focus Dashboard - 2026-06-12

## 1. 오늘의 핵심 목표
- 구매 사양서 AI 검토 체크리스트 작성

## 2. 오늘의 학습/실행 모듈
- AI Essential

## 3. KPI Card 형식 요약
- 오늘의 진행률 목표: 60%
- 완료 기준: 검토 기준과 승인 필요 항목 분리
- 남은 과제: 샘플 사양서 3건 검증
- 예상 산출물: 구매 사양서 AI 검토 템플릿

## 4. AI/AX 적용 관점
- 내 업무 문제: 발주 전 사양 검토가 사람 기억에 의존한다.
- AI로 바꿀 수 있는 형태: 사양서를 체크리스트와 비교해 누락 조건을 구조화한다.
- 필요한 기술: 프롬프트 설계, 문서 분류, JSON 스키마
- 예상 자동화 효과: 검토 초안 작성 시간을 50% 줄인다.

## 5. 오늘 첫 행동
- 최근 사양서 3건에서 반복 검토 항목을 추출한다.`;

export function AutomationImportForm() {
  const [pastedText, setPastedText] = useState("");
  const [parsed, setParsed] = useState<ParsedAutomationImport | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFiles, setUpdatedFiles] = useState<string[]>([]);

  function handlePreview() {
    try {
      setMessage("");
      setUpdatedFiles([]);
      setParsed(parseAutomationText(pastedText));
    } catch (error) {
      setParsed(null);
      setMessage(error instanceof Error ? error.message : "미리보기 파싱 실패");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setUpdatedFiles([]);

    try {
      const response = await fetch("/api/import-daily-focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastedText }),
      });
      const result = (await response.json()) as ImportDailyFocusResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "저장 실패");
      }

      setParsed(result.parsed ?? null);
      setUpdatedFiles(result.updatedFiles ?? []);
      setMessage("저장 완료");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 실패");
    } finally {
      setIsSaving(false);
    }
  }

  const canAct = pastedText.trim().length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="automation-import" className="text-base font-semibold text-slate-950">
          자동화 결과 붙여넣기
        </label>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          ChatGPT 자동화 결과 전체를 그대로 붙여넣고 미리보기로 파싱 결과를 확인한 뒤
          저장하세요.
        </p>
        <textarea
          id="automation-import"
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={placeholder}
          className="mt-4 min-h-[520px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!canAct}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canAct || isSaving}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "저장 중" : "저장"}
          </button>
          {message ? (
            <span
              className={`text-sm font-medium ${
                message === "저장 완료" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {message}
            </span>
          ) : null}
        </div>
        {updatedFiles.length > 0 ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs font-medium text-emerald-700">업데이트된 파일</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {updatedFiles.map((file) => (
                <span key={file} className="rounded bg-white px-2 py-1 font-mono text-xs text-emerald-800">
                  {file}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <ImportPreview parsed={parsed} />
    </div>
  );
}
