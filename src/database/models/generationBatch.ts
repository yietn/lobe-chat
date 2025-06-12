import debug from 'debug';
import { and, eq } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';
import { FileService } from '@/server/services/file';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation, GenerationAsset, GenerationBatch, GenerationConfig } from '@/types/generation';

import { GenerationBatchItem, NewGenerationBatch, generationBatches } from '../schemas/generation';

const log = debug('lobe-image:generation-batch-model');

export class GenerationBatchModel {
  private db: LobeChatDatabase;
  private userId: string;
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
    this.fileService = new FileService(db, userId);
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
      orderBy: (table, { asc }) => [asc(table.createdAt)],
      with: {
        generations: {
          orderBy: (table, { asc }) => [asc(table.createdAt), asc(table.id)],
          with: {
            asyncTask: true,
          },
        },
      },
    });

    log('Found %d generation batches with generations for topic %s', results.length, topicId);
    return results;
  }

  async queryGenerationBatchesByTopicIdWithGenerations(
    topicId: string,
  ): Promise<(GenerationBatch & { generations: (Generation & { asyncTaskId?: string })[] })[]> {
    log('Fetching generation batches for topic ID: %s for user: %s', topicId, this.userId);

    const batchesWithGenerations = await this.findByTopicIdWithGenerations(topicId);
    if (batchesWithGenerations.length === 0) {
      log('No batches found for topic: %s', topicId);
      return [];
    }

    // Transform the database result to match our frontend types
    const result: GenerationBatch[] = await Promise.all(
      batchesWithGenerations.map(async (batch) => {
        const generations = await Promise.all(
          batch.generations.map(async (gen): Promise<Generation & { asyncTaskId?: string }> => {
            const asset = gen.asset as GenerationAsset | null;
            if (asset && asset.url && asset.thumbnailUrl) {
              const [url, thumbnailUrl] = await Promise.all([
                this.fileService.getFullFileUrl(asset.url),
                this.fileService.getFullFileUrl(asset.thumbnailUrl),
              ]);
              asset.url = url;
              asset.thumbnailUrl = thumbnailUrl;
            }

            return {
              id: gen.id,
              asset,
              seed: gen.seed,
              createdAt: gen.createdAt,
              asyncTaskId: gen.asyncTaskId || undefined,
              task: {
                id: gen.asyncTaskId,
                status: gen.asyncTask?.status as AsyncTaskStatus,
                error: gen.asyncTask?.error ? gen.asyncTask.error : undefined,
              },
            };
          }),
        );

        return {
          id: batch.id,
          provider: batch.provider,
          model: batch.model,
          prompt: batch.prompt,
          width: batch.width,
          height: batch.height,
          config: batch.config as GenerationConfig,
          createdAt: batch.createdAt,
          generations,
        };
      }),
    );

    log('Feed construction complete for topic: %s, returning %d batches', topicId, result.length);
    return result;
  }

  async delete(id: string) {
    log('Deleting generation batch: %s for user: %s', id, this.userId);

    await this.db
      .delete(generationBatches)
      .where(and(eq(generationBatches.id, id), eq(generationBatches.userId, this.userId)));

    log('Generation batch %s deleted successfully', id);
  }
}
