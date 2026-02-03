import { count, eq } from 'drizzle-orm';

import { type NewAgentEvalTestCase, agentEvalTestCases } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export class AgentEvalTestCaseModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Create a single test case
   */
  create = async (params: NewAgentEvalTestCase) => {
    const [result] = await this.db.insert(agentEvalTestCases).values(params).returning();
    return result;
  };

  /**
   * Batch create test cases
   */
  batchCreate = async (cases: NewAgentEvalTestCase[]) => {
    return this.db.insert(agentEvalTestCases).values(cases).returning();
  };

  /**
   * Delete a test case by id
   */
  delete = async (id: string) => {
    return this.db.delete(agentEvalTestCases).where(eq(agentEvalTestCases.id, id));
  };

  /**
   * Find test case by id
   */
  findById = async (id: string) => {
    return this.db.query.agentEvalTestCases.findFirst({
      where: eq(agentEvalTestCases.id, id),
    });
  };

  /**
   * Find all test cases by dataset id with pagination
   */
  findByDatasetId = async (datasetId: string, limit?: number, offset?: number) => {
    const query = this.db
      .select()
      .from(agentEvalTestCases)
      .where(eq(agentEvalTestCases.datasetId, datasetId))
      .orderBy(agentEvalTestCases.sortOrder);

    if (limit !== undefined) {
      query.limit(limit);
    }
    if (offset !== undefined) {
      query.offset(offset);
    }

    return query;
  };

  /**
   * Count test cases by dataset id
   */
  countByDatasetId = async (datasetId: string) => {
    const result = await this.db
      .select({ value: count() })
      .from(agentEvalTestCases)
      .where(eq(agentEvalTestCases.datasetId, datasetId));
    return Number(result[0]?.value) || 0;
  };

  /**
   * Update test case
   */
  update = async (id: string, value: Partial<NewAgentEvalTestCase>) => {
    const [result] = await this.db
      .update(agentEvalTestCases)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(agentEvalTestCases.id, id))
      .returning();
    return result;
  };
}
