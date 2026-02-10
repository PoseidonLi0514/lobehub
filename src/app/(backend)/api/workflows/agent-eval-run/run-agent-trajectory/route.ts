import { serve } from '@upstash/workflow/nextjs';

import {
  AgentEvalRunModel,
  AgentEvalRunTopicModel,
  AgentEvalTestCaseModel,
} from '@/database/models/agentEval';
import { TopicModel } from '@/database/models/topic';
import { getServerDB } from '@/database/server';
import { type RunAgentTrajectoryPayload } from '@/server/workflows/agentEvalRun';
import { aiAgentService } from '@/services/aiAgent';

/**
 * Run agent trajectory workflow - executes a single agent runtime call
 * 1. Get test case content and run info
 * 2. Create topic for this attempt
 * 3. Create RunTopic association
 * 4. Execute agent with test case input
 * 5. Result is automatically saved to messages by execAgent
 */
export const { POST } = serve<RunAgentTrajectoryPayload>(
  async (context) => {
    const { runId, testCaseId, attemptNumber } = context.requestPayload ?? {};

    console.log('[agent-eval-run:run-agent-trajectory] Starting:', {
      attemptNumber,
      runId,
      testCaseId,
    });

    if (!runId || !testCaseId || attemptNumber === undefined) {
      return { error: 'Missing required parameters', success: false };
    }

    const db = await getServerDB();

    // Get run first to get userId
    const run = await context.run('agent-eval-run:get-run', async () => {
      const runModel = new AgentEvalRunModel(db, '');
      return runModel.findById(runId);
    });

    if (!run) {
      return { error: 'Run not found', success: false };
    }

    // Get test case
    const testCase = await context.run('agent-eval-run:get-test-case', async () => {
      const testCaseModel = new AgentEvalTestCaseModel(db, run.userId);
      return testCaseModel.findById(testCaseId);
    });

    if (!testCase) {
      return { error: 'Test case not found', success: false };
    }

    // Create topic for this attempt
    const topic = await context.run('agent-eval-run:create-topic', async () => {
      const topicModel = new TopicModel(db, run.userId);
      return topicModel.create({
        title: `[Eval #${attemptNumber + 1}] ${testCase.content.input?.slice(0, 50) || 'Test Case'}...`,
        trigger: 'eval',
      });
    });

    // Create RunTopic
    await context.run('agent-eval-run:create-run-topic', async () => {
      const runTopicModel = new AgentEvalRunTopicModel(db, run.userId);
      return runTopicModel.batchCreate([
        {
          runId,
          testCaseId,
          topicId: topic.id,
        },
      ]);
    });

    // Execute agent
    await context.run('agent-eval-run:exec-agent', async () => {
      return aiAgentService.execAgentTask({
        agentId: run.targetAgentId ?? undefined,
        appContext: {
          topicId: topic.id,
        },
        autoStart: true,
        prompt: testCase.content.input || '',
      });
    });

    console.log('[agent-eval-run:run-agent-trajectory] Completed:', {
      attemptNumber,
      runId,
      testCaseId,
      topicId: topic.id,
    });

    return {
      attemptNumber,
      success: true,
      testCaseId,
      topicId: topic.id,
    };
  },
  {
    flowControl: {
      key: 'agent-eval-run.run-agent-trajectory',
      parallelism: 10, // 控制 K 次执行的并发度
      ratePerSecond: 10,
    },
  },
);
