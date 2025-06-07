import debug from 'debug';
import { and, eq } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';

import { GenerationBatchItem, NewGenerationBatch, generationBatches } from '../schemas/generation';

const log = debug('lobe-image:generation-batch-model');

export class GenerationBatchModel {
  private db: LobeChatDatabase;
  private userId: string;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  async create(value: NewGenerationBatch): Promise<GenerationBatchItem> {
    log('Creating generation batch: %O', {
      userId: this.userId,
      topicId: value.generationTopicId,
    });

    const [result] = await this.db
      .insert(generationBatches)
      .values({ ...value, userId: this.userId })
      .returning();

    log('Generation batch created successfully: %s', result.id);
    return result;
  }

  async findById(id: string): Promise<GenerationBatchItem | undefined> {
    log('Finding generation batch by ID: %s for user: %s', id, this.userId);

    const result = await this.db.query.generationBatches.findFirst({
      where: and(eq(generationBatches.id, id), eq(generationBatches.userId, this.userId)),
    });

    log('Generation batch %s: %s', id, result ? 'found' : 'not found');
    return result;
  }

  async findByTopicId(topicId: string): Promise<GenerationBatchItem[]> {
    log('Finding generation batches by topic ID: %s for user: %s', topicId, this.userId);

    const results = await this.db.query.generationBatches.findMany({
      where: and(
        eq(generationBatches.generationTopicId, topicId),
        eq(generationBatches.userId, this.userId),
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    log('Found %d generation batches for topic %s', results.length, topicId);
    return results;
  }

  /**
   * Find batches with their associated generations using relations
   */
  async findByTopicIdWithGenerations(topicId: string) {
    log(
      'Finding generation batches with generations for topic ID: %s for user: %s',
      topicId,
      this.userId,
    );

    const results = await this.db.query.generationBatches.findMany({
      where: and(
        eq(generationBatches.generationTopicId, topicId),
        eq(generationBatches.userId, this.userId),
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      with: {
        generations: {
          orderBy: (table, { asc }) => [asc(table.createdAt)],
        },
      },
    });

    log('Found %d generation batches with generations for topic %s', results.length, topicId);
    return results;
  }

  async delete(id: string) {
    log('Deleting generation batch: %s for user: %s', id, this.userId);

    await this.db
      .delete(generationBatches)
      .where(and(eq(generationBatches.id, id), eq(generationBatches.userId, this.userId)));

    log('Generation batch %s deleted successfully', id);
  }
}
