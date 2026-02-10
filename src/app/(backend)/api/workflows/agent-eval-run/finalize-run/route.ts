import { serve } from '@upstash/workflow/nextjs';

import { AgentEvalRunModel, AgentEvalRunTopicModel } from '@/database/models/agentEval';
import { MessageModel } from '@/database/models/message';
import { getServerDB } from '@/database/server';
import { type FinalizeRunPayload } from '@/server/workflows/agentEvalRun';

/**
 * Finalize run workflow - aggregates results and updates run status
 * 1. Get all RunTopics for this run
 * 2. For each RunTopic, get messages from topic
 * 3. Aggregate results (count completed, failed, etc.)
 * 4. Calculate metrics
 * 5. Update run status to 'completed'
 */
export const { POST } = serve<FinalizeRunPayload>(
  async (context) => {
    const { runId } = context.requestPayload ?? {};

    console.log('[agent-eval-run:finalize-run] Starting:', { runId });

    if (!runId) {
      return { error: 'Missing runId', success: false };
    }

    const db = await getServerDB();

    // Get all RunTopics
    const runTopics = await context.run('agent-eval-run:get-run-topics', async () => {
      const runTopicModel = new AgentEvalRunTopicModel(db, '');
      return runTopicModel.findByRunId(runId);
    });

    console.log('[agent-eval-run:finalize-run] Total RunTopics:', runTopics.length);

    // Aggregate results
    const metrics = await context.run('agent-eval-run:aggregate-results', async () => {
      const messageModel = new MessageModel(db, '');

      let completedCases = 0;
      let failedCases = 0;

      for (const runTopic of runTopics) {
        const messages = await messageModel.query({ topicId: runTopic.topicId });

        // Simple heuristic: if there are messages, consider it completed
        // TODO: Add more sophisticated success/failure detection
        if (messages.length > 0) {
          completedCases++;
        } else {
          failedCases++;
        }
      }

      return {
        averageScore: completedCases / runTopics.length, // Placeholder
        failedCases,
        passRate: completedCases / runTopics.length,
        passedCases: completedCases, // TODO: Replace with actual scoring
        totalCases: runTopics.length,
      };
    });

    console.log('[agent-eval-run:finalize-run] Metrics:', metrics);

    // Update run status
    await context.run('agent-eval-run:update-run', async () => {
      const runModel = new AgentEvalRunModel(db, '');
      return runModel.update(runId, {
        metrics,
        status: 'completed',
      });
    });

    console.log('[agent-eval-run:finalize-run] Run completed:', { runId });

    return {
      metrics,
      runId,
      success: true,
    };
  },
  {
    flowControl: {
      key: 'agent-eval-run.finalize-run',
      parallelism: 1,
      ratePerSecond: 1,
    },
  },
);
