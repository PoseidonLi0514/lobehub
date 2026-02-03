import { and, desc, eq } from 'drizzle-orm';

import { type NewAgentEvalBenchmark, agentEvalBenchmarks } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export class AgentEvalBenchmarkModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Create a new benchmark
   */
  create = async (params: NewAgentEvalBenchmark) => {
    const [result] = await this.db.insert(agentEvalBenchmarks).values(params).returning();
    return result;
  };

  /**
   * Delete a benchmark by id (only user-created benchmarks)
   */
  delete = async (id: string) => {
    return this.db
      .delete(agentEvalBenchmarks)
      .where(and(eq(agentEvalBenchmarks.id, id), eq(agentEvalBenchmarks.isSystem, false)));
  };

  /**
   * Query benchmarks (system + user-created)
   * @param includeSystem - Whether to include system benchmarks (default: true)
   */
  query = async (includeSystem = true) => {
    const conditions = includeSystem ? undefined : eq(agentEvalBenchmarks.isSystem, false);

    return this.db
      .select()
      .from(agentEvalBenchmarks)
      .where(conditions)
      .orderBy(desc(agentEvalBenchmarks.createdAt));
  };

  /**
   * Find benchmark by id
   */
  findById = async (id: string) => {
    return this.db.query.agentEvalBenchmarks.findFirst({
      where: eq(agentEvalBenchmarks.id, id),
    });
  };

  /**
   * Find benchmark by identifier
   */
  findByIdentifier = async (identifier: string) => {
    return this.db.query.agentEvalBenchmarks.findFirst({
      where: eq(agentEvalBenchmarks.identifier, identifier),
    });
  };

  /**
   * Update benchmark (only user-created benchmarks)
   */
  update = async (id: string, value: Partial<NewAgentEvalBenchmark>) => {
    const [result] = await this.db
      .update(agentEvalBenchmarks)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(agentEvalBenchmarks.id, id), eq(agentEvalBenchmarks.isSystem, false)))
      .returning();
    return result;
  };
}
