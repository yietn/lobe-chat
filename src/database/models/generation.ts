import debug from 'debug';
import { and, eq } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';

import { GenerationItem, NewGeneration, generations } from '../schemas/generation';

// Create debug logger
const log = debug('lobe-image:generation-model');

export class GenerationModel {
  private db: LobeChatDatabase;
  private userId: string;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  async create(value: NewGeneration): Promise<GenerationItem> {
    log('Creating generation: %O', {
      userId: this.userId,
      generationBatchId: value.generationBatchId,
    });

    const [result] = await this.db
      .insert(generations)
      .values({ ...value, userId: this.userId })
      .returning();

    log('Generation created successfully: %s', result.id);
    return result;
  }

  async findById(id: string): Promise<GenerationItem | undefined> {
    log('Finding generation by ID: %s for user: %s', id, this.userId);

    const result = await this.db.query.generations.findFirst({
      where: and(eq(generations.id, id), eq(generations.userId, this.userId)),
    });

    log('Generation %s: %s', id, result ? 'found' : 'not found');
    return result;
  }

  async findByIdWithAsyncTask(id: string): Promise<GenerationItem | undefined> {
    log('Finding generation by ID: %s for user: %s', id, this.userId);

    const result = await this.db.query.generations.findFirst({
      where: and(eq(generations.id, id), eq(generations.userId, this.userId)),
      with: {
        asyncTask: true,
      },
    });

    log('Generation %s: %s', id, result ? 'found' : 'not found');
    return result;
  }

  async update(id: string, value: Partial<NewGeneration>) {
    log('Updating generation: %s with values: %O', id, {
      hasAsset: !!value.asset,
      asyncTaskId: value.asyncTaskId,
    });

    const result = await this.db
      .update(generations)
      .set(value)
      .where(and(eq(generations.id, id), eq(generations.userId, this.userId)));

    log('Generation %s updated successfully', id);
    return result;
  }
}
