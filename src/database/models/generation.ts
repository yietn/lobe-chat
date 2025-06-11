import debug from 'debug';
import { and, eq } from 'drizzle-orm';

import { LobeChatDatabase, Transaction } from '@/database/type';
import { GenerationAsset } from '@/types/generation';

import { NewFile } from '../schemas';
import { GenerationItem, NewGeneration, generations } from '../schemas/generation';
import { FileModel } from './file';

// Create debug logger
const log = debug('lobe-image:generation-model');

export class GenerationModel {
  private db: LobeChatDatabase;
  private userId: string;
  private fileModel: FileModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
    this.fileModel = new FileModel(db, userId);
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

  async update(id: string, value: Partial<NewGeneration>, trx?: Transaction) {
    log('Updating generation: %s with values: %O', id, {
      hasAsset: !!value.asset,
      asyncTaskId: value.asyncTaskId,
    });

    const executeUpdate = async (tx: Transaction) => {
      return await tx
        .update(generations)
        .set({ ...value, updatedAt: new Date() })
        .where(and(eq(generations.id, id), eq(generations.userId, this.userId)));
    };

    const result = await (trx ? executeUpdate(trx) : this.db.transaction(executeUpdate));

    log('Generation %s updated successfully', id);
    return result;
  }

  async updateAssetAndFile(
    id: string,
    asset: GenerationAsset,
    file: Omit<NewFile, 'id' | 'userId'>,
  ) {
    log('Updating generation asset and file with transaction: %s', id);

    return await this.db.transaction(async (tx: Transaction) => {
      // Create file first using transaction
      // Since duplicates are very rare, we always create globalFile - checking existence first would be wasteful
      const newFile = await this.fileModel.create(file, true, tx);

      // Update generation with asset and fileId using the transaction-aware update method
      await this.update(
        id,
        {
          asset,
          fileId: newFile.id,
        },
        tx,
      );

      log('Generation %s updated with asset and file %s successfully', id, newFile.id);

      return {
        file: newFile,
      };
    });
  }

  async delete(id: string, trx?: Transaction) {
    log('Deleting generation: %s for user: %s', id, this.userId);

    const executeDelete = async (tx: Transaction) => {
      return await tx
        .delete(generations)
        .where(and(eq(generations.id, id), eq(generations.userId, this.userId)));
    };

    const result = await (trx ? executeDelete(trx) : this.db.transaction(executeDelete));

    log('Generation %s deleted successfully', id);
    return result;
  }

  async deleteGenerationAndFile(id: string) {
    log('Deleting generation and file with transaction: %s for user: %s', id, this.userId);

    return await this.db.transaction(async (tx: Transaction) => {
      // First, find the generation to get the associated file ID
      const generation = await tx.query.generations.findFirst({
        where: and(eq(generations.id, id), eq(generations.userId, this.userId)),
      });

      if (!generation) {
        log('Generation %s not found', id);
        return null;
      }

      // Delete the generation record using the transaction-aware delete method
      await this.delete(id, tx);

      let deletedFile = null;
      // If there's an associated file, delete it as well
      if (generation.fileId) {
        log('Deleting associated file: %s for generation: %s', generation.fileId, id);

        // Delete the file from database using transaction and get the file info for potential S3 cleanup
        deletedFile = await this.fileModel.delete(generation.fileId, true, tx);

        log('Associated file %s deleted for generation: %s', generation.fileId, id);
      }

      return {
        generation,
        deletedFile,
      };
    });
  }
}
