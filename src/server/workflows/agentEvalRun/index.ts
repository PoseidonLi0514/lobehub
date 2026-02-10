import { Client } from '@upstash/workflow';
import debug from 'debug';

import { AgentEvalRunTopicModel } from '@/database/models/agentEval';
import type { LobeChatDatabase } from '@/database/type';

const log = debug('lobe-cloud:workflows:agent-eval-run');

// Workflow paths
const WORKFLOW_PATHS = {
  executeTestCase: '/api/workflows/agent-eval-run/execute-test-case',
  finalizeRun: '/api/workflows/agent-eval-run/finalize-run',
  paginateTestCases: '/api/workflows/agent-eval-run/paginate-test-cases',
  runAgentTrajectory: '/api/workflows/agent-eval-run/run-agent-trajectory',
  runBenchmark: '/api/workflows/agent-eval-run/run-benchmark',
} as const;

// Workflow payload types
export interface RunBenchmarkPayload {
  dryRun?: boolean;
  force?: boolean;
  runId: string;
}

export interface PaginateTestCasesPayload {
  cursor?: string; // testCase.id
  runId: string;
  testCaseIds?: string[]; // For fanout chunks
}

export interface ExecuteTestCasePayload {
  runId: string;
  testCaseId: string;
}

export interface RunAgentTrajectoryPayload {
  attemptNumber: number;
  runId: string;
  testCaseId: string;
}

export interface FinalizeRunPayload {
  runId: string;
}

/**
 * Get workflow URL using APP_URL
 */
const getWorkflowUrl = (path: string): string => {
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) throw new Error('APP_URL is required to trigger workflows');
  return new URL(path, baseUrl).toString();
};

/**
 * Get workflow client
 */
const getWorkflowClient = (): Client => {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error('QSTASH_TOKEN is required to trigger workflows');

  const config: ConstructorParameters<typeof Client>[0] = { token };
  if (process.env.QSTASH_URL) {
    (config as Record<string, unknown>).url = process.env.QSTASH_URL;
  }
  return new Client(config);
};

/**
 * Agent Eval Run Workflow
 *
 * Handles workflow triggering for agent evaluation run execution.
 */
export class AgentEvalRunWorkflow {
  private static client: Client;

  private static getClient(): Client {
    if (!this.client) {
      this.client = getWorkflowClient();
    }
    return this.client;
  }

  /**
   * Trigger workflow to run benchmark (entry point)
   */
  static triggerRunBenchmark(payload: RunBenchmarkPayload) {
    const url = getWorkflowUrl(WORKFLOW_PATHS.runBenchmark);
    log('Triggering run-benchmark workflow for run: %s', payload.runId);
    return this.getClient().trigger({ body: payload, url });
  }

  /**
   * Trigger workflow to paginate test cases
   */
  static triggerPaginateTestCases(payload: PaginateTestCasesPayload) {
    const url = getWorkflowUrl(WORKFLOW_PATHS.paginateTestCases);
    log('Triggering paginate-test-cases workflow for run: %s', payload.runId);
    return this.getClient().trigger({ body: payload, url });
  }

  /**
   * Trigger workflow to execute a test case K times
   */
  static triggerExecuteTestCase(payload: ExecuteTestCasePayload) {
    const url = getWorkflowUrl(WORKFLOW_PATHS.executeTestCase);
    log(
      'Triggering execute-test-case workflow: run=%s, testCase=%s',
      payload.runId,
      payload.testCaseId,
    );
    return this.getClient().trigger({ body: payload, url });
  }

  /**
   * Trigger workflow to run a single agent trajectory
   */
  static triggerRunAgentTrajectory(payload: RunAgentTrajectoryPayload) {
    const url = getWorkflowUrl(WORKFLOW_PATHS.runAgentTrajectory);
    log(
      'Triggering run-agent-trajectory workflow: run=%s, testCase=%s, attempt=%s',
      payload.runId,
      payload.testCaseId,
      payload.attemptNumber,
    );
    return this.getClient().trigger({ body: payload, url });
  }

  /**
   * Trigger workflow to finalize run
   */
  static triggerFinalizeRun(payload: FinalizeRunPayload) {
    const url = getWorkflowUrl(WORKFLOW_PATHS.finalizeRun);
    log('Triggering finalize-run workflow for run: %s', payload.runId);
    return this.getClient().trigger({ body: payload, url });
  }

  /**
   * Filter out test cases that already have RunTopics
   * @returns Test case IDs that need execution
   */
  static async filterTestCasesNeedingExecution(
    db: LobeChatDatabase,
    runId: string,
    testCaseIds: string[],
  ): Promise<string[]> {
    if (testCaseIds.length === 0) return [];

    const agentEvalRunTopicModel = new AgentEvalRunTopicModel(db, ''); // userId not needed for query

    // Get existing RunTopics for this run
    const existingRunTopics = await agentEvalRunTopicModel.findByRunId(runId);
    const existingTestCaseIds = new Set(
      existingRunTopics.map((rt: { testCaseId: string }) => rt.testCaseId),
    );

    // Return test cases that don't have RunTopics yet
    return testCaseIds.filter((id) => !existingTestCaseIds.has(id));
  }
}
