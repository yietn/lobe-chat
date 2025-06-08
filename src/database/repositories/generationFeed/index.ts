import debug from 'debug';

import { GenerationModel } from '@/database/models/generation';
import { GenerationBatchModel } from '@/database/models/generationBatch';
import { LobeChatDatabase } from '@/database/type';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation, GenerationAsset, GenerationBatch, GenerationConfig } from '@/types/generation';

const log = debug('lobe-db:generation-feed-repo');

export class GenerationFeedRepository {
  private db: LobeChatDatabase;
  private userId: string;
  private generationBatchModel: GenerationBatchModel;
  private generationModel: GenerationModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
    this.generationBatchModel = new GenerationBatchModel(db, userId);
    this.generationModel = new GenerationModel(db, userId);
  }

  /**
   * Get generation batches with their associated generations for a specific topic
   * Using drizzle relations to simplify the query
   */
  async getGenerationBatchesByTopicId(topicId: string): Promise<GenerationBatch[]> {
    log('Fetching generation batches for topic ID: %s for user: %s', topicId, this.userId);

    // Use the new method with relations to get batches and generations in one query
    const batchesWithGenerations =
      await this.generationBatchModel.findByTopicIdWithGenerations(topicId);

    if (batchesWithGenerations.length === 0) {
      log('No batches found for topic: %s', topicId);
      return [];
    }

    // Transform the database result to match our frontend types
    const result: GenerationBatch[] = batchesWithGenerations.map((batch) => ({
      id: batch.id,
      provider: batch.provider,
      model: batch.model,
      prompt: batch.prompt,
      width: batch.width,
      height: batch.height,
      config: batch.config as GenerationConfig,
      createdAt: batch.createdAt,
      generations: batch.generations.map(
        (gen): Generation => ({
          id: gen.id,
          asset: gen.asset as GenerationAsset | null,
          seed: gen.seed,
          createdAt: gen.createdAt,
          task: {
            status: gen.asyncTask?.status as AsyncTaskStatus,
            error: gen.asyncTask?.error ? gen.asyncTask.error : undefined,
          },
        }),
      ),
    }));

    log('Feed construction complete for topic: %s, returning %d batches', topicId, result.length);
    return result;
  }
}
