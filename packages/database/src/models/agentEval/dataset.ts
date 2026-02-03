import { and, desc, eq, isNull, or } from 'drizzle-orm';

import { type NewAgentEvalDataset, agentEvalDatasets } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export class AgentEvalDatasetModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Create a new dataset
   */
  create = async (params: NewAgentEvalDataset) => {
    const [result] = await this.db
      .insert(agentEvalDatasets)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  /**
   * Delete a dataset by id
   */
  delete = async (id: string) => {
    return this.db
      .delete(agentEvalDatasets)
      .where(and(eq(agentEvalDatasets.id, id), eq(agentEvalDatasets.userId, this.userId)));
  };

  /**
   * Query datasets (system + user-owned)
   * @param benchmarkId - Optional benchmark filter
   */
  query = async (benchmarkId?: string) => {
    const conditions = [
      or(eq(agentEvalDatasets.userId, this.userId), isNull(agentEvalDatasets.userId)),
    ];

    if (benchmarkId) {
      conditions.push(eq(agentEvalDatasets.benchmarkId, benchmarkId));
    }

    return this.db
      .select()
      .from(agentEvalDatasets)
      .where(and(...conditions))
      .orderBy(desc(agentEvalDatasets.createdAt));
  };

  /**
   * Find dataset by id (with test cases)
   */
  findById = async (id: string) => {
    return this.db.query.agentEvalDatasets.findFirst({
      where: and(
        eq(agentEvalDatasets.id, id),
        or(eq(agentEvalDatasets.userId, this.userId), isNull(agentEvalDatasets.userId)),
      ),
      with: {
        testCases: {
          orderBy: (testCases, { asc }) => [asc(testCases.sortOrder)],
        },
      },
    });
  };

  /**
   * Update dataset
   */
  update = async (id: string, value: Partial<NewAgentEvalDataset>) => {
    const [result] = await this.db
      .update(agentEvalDatasets)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(agentEvalDatasets.id, id), eq(agentEvalDatasets.userId, this.userId)))
      .returning();
    return result;
  };
}
