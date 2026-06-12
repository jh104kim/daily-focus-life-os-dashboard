import { SectionHeader } from "@/components/dashboard/section-header";
import { SourceFooter } from "@/components/dashboard/source-footer";
import { EvidenceLogTable } from "@/components/evidence/evidence-log-table";
import { sortByUpdatedAt } from "@/lib/dashboard-utils";
import { evidenceLogs } from "@/lib/mock-data";

export default function EvidencePage() {
  return (
    <div>
      <SectionHeader
        title="Evidence / Output Log"
        description="문서, 코드, 대시보드, 회고 산출물을 관련 목표와 학습 모듈에 연결합니다."
        futureTableName="evidence_logs"
      />
      <EvidenceLogTable logs={sortByUpdatedAt(evidenceLogs)} />
      <SourceFooter tableName="evidence_logs" />
    </div>
  );
}
