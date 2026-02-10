import { serve } from '@upstash/workflow/nextjs';

import { AgentEvalRunModel } from '@/database/models/agentEval';
import { getServerDB } from '@/database/server';
import { AgentEvalRunWorkflow, type ExecuteTestCasePayload } from '@/server/workflows/agentEvalRun';

/**
 * Execute test case workflow - manages K executions of a single test case
 * 1. Get run config to determine K value
 * 2. Trigger K parallel run-agent-trajectory workflows
 * 3. Each trajectory executes the agent once and stores results
 */
export const { POST } = serve<ExecuteTestCasePayload>(
  async (context) => {
    const { runId, testCaseId } = context.requestPayload ?? {};

    console.log('[agent-eval-run:execute-test-case] Starting:', { runId, testCaseId });

    if (!runId || !testCaseId) {
      return { error: 'Missing runId or testCaseId', success: false };
    }

    const db = await getServerDB();

    // Get run to get K value from config
    const run = await context.run('agent-eval-run:get-run', async () => {
      const runModel = new AgentEvalRunModel(db, '');
      return runModel.findById(runId);
    });

    if (!run) {
      return { error: 'Run not found', success: false };
    }

    // Get K value (default to 1 if not specified)
    const k = run.config?.k ?? 1;

    console.log('[agent-eval-run:execute-test-case] Executing test case', {
      k,
      runId,
      testCaseId,
    });

    // Trigger K parallel run-agent-trajectory workflows
    await Promise.all(
      Array.from({ length: k }).map((_, i) =>
        context.run(`agent-eval-run:trajectory:${testCaseId}:${i}`, () =>
          AgentEvalRunWorkflow.triggerRunAgentTrajectory({
            attemptNumber: i,
            runId,
            testCaseId,
          }),
        ),
      ),
    );

    console.log('[agent-eval-run:execute-test-case] Completed:', {
      k,
      runId,
      testCaseId,
    });

    return {
      k,
      success: true,
      testCaseId,
    };
  },
  {
    flowControl: {
      key: 'agent-eval-run.execute-test-case',
      parallelism: 20,
      ratePerSecond: 5,
    },
  },
);
