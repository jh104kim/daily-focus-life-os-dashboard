"use client";

import { useState } from "react";
import type {
  DailyFocusPlan,
  EvidenceLog,
  ParsedDailyOperationImport,
  Reflection,
} from "@/lib/types";

interface DailyOperationImportFormProps {
  selectedDate: string;
  focus: DailyFocusPlan | undefined;
  evidenceLogs: EvidenceLog[];
  reflection: Reflection | undefined;
  onSaved: () => void;
}

export function DailyOperationImportForm({
  selectedDate,
  focus,
  evidenceLogs,
  reflection,
  onSaved,
}: DailyOperationImportFormProps) {
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState<ParsedDailyOperationImport | undefined>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePreview() {
    await submit(true);
  }

  async function handleSave() {
    await submit(false);
  }

  async function submit(dryRun: boolean) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/daily-operation-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastedText, selectedDate, dryRun }),
      });
      const result = (await response.json()) as {
        success: boolean;
        parsed?: ParsedDailyOperationImport;
        message?: string;
      };

      if (!response.ok || !result.success || !result.parsed) {
        throw new Error(result.message || "운영 기록 분류 실패");
      }

      setPreview(result.parsed);
      setMessage(dryRun ? "분류 미리보기 완료" : "운영 기록 저장 완료");

      if (!dryRun) {
        onSaved();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "운영 기록 처리 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">운영 기록 일괄 붙여넣기</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            회고와 산출물 로그를 한 번에 붙여넣으면 `reflections`와 `evidence_logs`
            스키마로 분류합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            JSON 저장
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <textarea
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            placeholder={`오늘 완료한 것:\n- 성능측정 리포트 자동화 흐름 정리\n\n아쉬웠던 점/막힌 점:\n- 샘플 데이터 컬럼 정의가 아직 부족함\n\n내일 가장 먼저 할 일:\n- 실제 리포트 1건의 입력/출력 컬럼을 표시한다\n\n오늘 배운 것:\n- 반복 판단 구간은 먼저 표준 입력으로 쪼개야 한다\n\n내 업무에 적용할 지점:\n- 성능측정 결과 요약과 메일 초안 자동화\n\n산출물 로그:\n- 문서: 성능측정 자동화 워크플로우 초안\n- 대시보드: Daily 운영 상태 카드 개선`}
            className="min-h-80 w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm leading-6 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-1">선택 날짜: {selectedDate}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              Daily Focus: {focus ? "연결" : "없음"}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              Reflection: {reflection ? "수정 대상" : "신규 생성"}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1">
              기존 Evidence: {evidenceLogs.length}개
            </span>
          </div>
          {message ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <PreviewBlock
            title="reflections.json"
            value={preview?.reflection ?? {
              selectedDate,
              completed: [],
              misses: [],
              tomorrowFirstAction: "",
              tomorrowGoalDraft: "",
              learnings: [],
              applicationPoints: [],
            }}
          />
          <PreviewBlock title="evidence-logs.json" value={preview?.evidenceLogs ?? []} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-500">분류 상태</div>
            <div className="mt-2 grid gap-2 text-sm text-slate-700">
              <div>누락 필드: {preview?.missingFields.join(", ") || "없음"}</div>
              <div>자동 보정: {preview?.autoFilledFields.join(", ") || "없음"}</div>
              <div>회고 덮어쓰기: {preview?.overwrite.reflection ? "예" : "아니오"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-950 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-300">{title}</div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
