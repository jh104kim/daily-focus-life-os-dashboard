interface SourceFooterProps {
  tableName: string;
}

export function SourceFooter({ tableName }: SourceFooterProps) {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      <span className="font-medium text-slate-900">데이터 소스:</span> mock
      <span className="mx-2 text-slate-300">|</span>
      <span className="font-medium text-slate-900">다음 단계:</span>{" "}
      <span className="font-mono">{tableName}</span> 테이블 연결 예정
    </div>
  );
}
