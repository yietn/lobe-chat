import { lambdaClient } from '@/libs/trpc/client';
import { Generation, GenerationBatch } from '@/types/generation';

type GenerationBatchWithAsyncTaskId = GenerationBatch & {
  generations: (Generation & { asyncTaskId?: string })[];
};

class GenerationBatchService {
  /**
   * Get generation batches for a specific topic
   */
  async getGenerationBatches(topicId: string): Promise<GenerationBatchWithAsyncTaskId[]> {
    return lambdaClient.generationBatch.getGenerationBatches.query({ topicId });
  }
}

export const generationBatchService = new GenerationBatchService();
