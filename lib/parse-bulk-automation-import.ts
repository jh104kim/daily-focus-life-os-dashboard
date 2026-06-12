import { routeAutomationBlock } from "./bulk-automation-import-router";
import type { AutomationParseContext } from "./parse-automation-unified";
import { splitAutomationBulkText } from "./split-automation-bulk-text";
import type {
  AutomationBlock,
  AutomationImportPreview,
  BulkAutomationImportPreview,
  JsonFileDiff,
} from "./types";

export interface BulkParseResult extends Omit<BulkAutomationImportPreview, "diff"> {
  blocksRaw: AutomationBlock[];
  diff: JsonFileDiff[];
}

export function parseBulkAutomationImport({
  pastedText,
  selectedDate,
  importBatchId,
  context,
  buildDiff,
}: {
  pastedText: string;
  selectedDate: string;
  importBatchId: string;
  context: AutomationParseContext;
  buildDiff: (previews: AutomationImportPreview[]) => JsonFileDiff[];
}): BulkParseResult {
  const blocks = splitAutomationBulkText(pastedText, importBatchId, selectedDate);
  const routedPreviews = blocks.map((block) =>
    routeAutomationBlock(block, importBatchId, context),
  );
  const previews = routedPreviews.filter(
    (preview): preview is AutomationImportPreview => Boolean(preview),
  );
  const unknownBlocks = blocks.filter((block) => block.automationType === "unknown");
  const diff = buildDiff(previews);
  const targetFiles = Array.from(new Set(previews.flatMap((preview) => preview.targetFiles)));
  const automationTypes = Array.from(new Set(blocks.map((block) => block.automationType)));

  return {
    importBatchId,
    detectedBlockCount: blocks.length,
    parsedBlockCount: previews.length,
    unknownBlockCount: unknownBlocks.length,
    automationTypes,
    targetFiles,
    blocks: blocks.map((block, index) => {
      const preview = routedPreviews[index];
      return {
        importBlockId: block.importBlockId,
        automationType: block.automationType,
        targetDate: block.targetDate,
        sourceTitle: block.sourceTitle,
        targetFiles: preview?.targetFiles ?? [],
        success: block.automationType !== "unknown" && Boolean(preview),
        warnings: preview?.warnings ?? (block.automationType === "unknown" ? ["분류 실패"] : []),
        missingFields: preview?.missingFields ?? [],
        autoFilledFields: preview?.autoFilledFields ?? [],
      };
    }),
    previews,
    blocksRaw: blocks,
    unknownBlocks,
    diff,
    warnings: unknownBlocks.length > 0 ? [`unknown block ${unknownBlocks.length}개`] : [],
  };
}
