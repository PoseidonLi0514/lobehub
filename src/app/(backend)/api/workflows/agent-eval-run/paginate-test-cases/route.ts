import { serve } from '@upstash/workflow/nextjs';
import { chunk } from 'es-toolkit/compat';

import { AgentEvalRunModel, AgentEvalTestCaseModel } from '@/database/models/agentEval';
import { getServerDB } from '@/database/server';
import {
  AgentEvalRunWorkflow,
  type PaginateTestCasesPayload,
} from '@/server/workflows/agentEvalRun';

const CHUNK_SIZE = 20; // Max items to process directly
const PAGE_SIZE = 50; // Items per page

/**
 * Paginate test cases workflow - handles pagination, filtering, and fanout
 */
export const { POST } = serve<PaginateTestCasesPayload>(
  async (context) => {
    const { runId, cursor, testCaseIds: payloadTestCaseIds } = context.requestPayload ?? {};

    console.log('[agent-eval-run:paginate-test-cases] Starting with payload:', {
      cursor,
      runId,
      testCaseIdsCount: payloadTestCaseIds?.length ?? 0,
    });

    if (!runId) {
      return { error: 'Missing runId in payload', success: false };
    }

    const db = await getServerDB();

    // If specific testCaseIds are provided (from fanout), process them directly
    if (payloadTestCaseIds && payloadTestCaseIds.length > 0) {
      console.log('[agent-eval-run:paginate-test-cases] Processing fanout chunk:', {
        count: payloadTestCaseIds.length,
      });

      await Promise.all(
        payloadTestCaseIds.map((testCaseId) =>
          context.run(`agent-eval-run:execute:${testCaseId}`, () =>
            AgentEvalRunWorkflow.triggerExecuteTestCase({ runId, testCaseId }),
          ),
        ),
      );

      return {
        processedTestCases: payloadTestCaseIds.length,
        success: true,
      };
    }

    // Paginate through test cases
    const testCaseBatch = await context.run('agent-eval-run:get-test-cases-page', async () => {
      // Get run to find datasetId and userId
      const runModel = new AgentEvalRunModel(db, '');
      const run = await runModel.findById(runId);
      if (!run) return { ids: [] };

      // Get test cases for this dataset
      const testCaseModel = new AgentEvalTestCaseModel(db, run.userId);
      const allTestCases = await testCaseModel.findByDatasetId(run.datasetId);

      // Apply cursor-based pagination
      const startIndex = cursor
        ? allTestCases.findIndex((tc: { id: string }) => tc.id === cursor) + 1
        : 0;

      const page = allTestCases.slice(startIndex, startIndex + PAGE_SIZE);

      if (!page.length) return { ids: [] };

      const last = page.at(-1);
      return {
        cursor: last?.id,
        ids: page.map((tc: { id: string }) => tc.id),
      };
    });

    const batchTestCaseIds = testCaseBatch.ids;
    const nextCursor = 'cursor' in testCaseBatch ? testCaseBatch.cursor : undefined;

    console.log('[agent-eval-run:paginate-test-cases] Got test case batch:', {
      batchSize: batchTestCaseIds.length,
      nextCursor: nextCursor ?? null,
    });

    if (batchTestCaseIds.length === 0) {
      console.log('[agent-eval-run:paginate-test-cases] No more test cases');

      // Trigger finalize-run workflow
      await context.run('agent-eval-run:trigger-finalize', () =>
        AgentEvalRunWorkflow.triggerFinalizeRun({ runId }),
      );

      return { message: 'Pagination complete, finalization triggered', success: true };
    }

    // Filter test cases that need execution
    const testCaseIds = await context.run('agent-eval-run:filter-existing', () =>
      AgentEvalRunWorkflow.filterTestCasesNeedingExecution(db, runId, batchTestCaseIds),
    );

    console.log('[agent-eval-run:paginate-test-cases] After filtering:', {
      needExecution: testCaseIds.length,
      skipped: batchTestCaseIds.length - testCaseIds.length,
    });

    // Process test cases if any need execution
    if (testCaseIds.length > 0) {
      if (testCaseIds.length > CHUNK_SIZE) {
        // Fanout to smaller chunks
        const chunks = chunk(testCaseIds, CHUNK_SIZE);
        console.log('[agent-eval-run:paginate-test-cases] Fanout mode:', {
          chunkSize: CHUNK_SIZE,
          chunks: chunks.length,
          totalTestCases: testCaseIds.length,
        });

        await Promise.all(
          chunks.map((ids, idx) =>
            context.run(`agent-eval-run:fanout:${idx + 1}/${chunks.length}`, () =>
              AgentEvalRunWorkflow.triggerPaginateTestCases({ runId, testCaseIds: ids }),
            ),
          ),
        );
      } else {
        // Process directly
        console.log('[agent-eval-run:paginate-test-cases] Processing test cases directly:', {
          count: testCaseIds.length,
        });

        await Promise.all(
          testCaseIds.map((testCaseId) =>
            context.run(`agent-eval-run:execute:${testCaseId}`, () =>
              AgentEvalRunWorkflow.triggerExecuteTestCase({ runId, testCaseId }),
            ),
          ),
        );
      }
    }

    // Schedule next page
    if (nextCursor) {
      console.log('[agent-eval-run:paginate-test-cases] Scheduling next page');
      await context.run('agent-eval-run:next-page', () =>
        AgentEvalRunWorkflow.triggerPaginateTestCases({ cursor: nextCursor, runId }),
      );
    } else {
      console.log('[agent-eval-run:paginate-test-cases] Last page, triggering finalize');
      await context.run('agent-eval-run:trigger-finalize', () =>
        AgentEvalRunWorkflow.triggerFinalizeRun({ runId }),
      );
    }

    return {
      nextCursor: nextCursor ?? null,
      processedTestCases: testCaseIds.length,
      skippedTestCases: batchTestCaseIds.length - testCaseIds.length,
      success: true,
    };
  },
  {
    flowControl: {
      key: 'agent-eval-run.paginate-test-cases',
      parallelism: 20,
      ratePerSecond: 5,
    },
  },
);
