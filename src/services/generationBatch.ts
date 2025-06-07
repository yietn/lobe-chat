import { lambdaClient } from '@/libs/trpc/client';
import { GenerationBatch } from '@/types/generation';

class GenerationBatchService {
  /**
   * Get generation batches for a specific topic
   */
  async getGenerationBatches(topicId: string): Promise<GenerationBatch[]> {
    return lambdaClient.generationBatch.getGenerationBatches.query({ topicId });
  }
}

export const generationBatchService = new GenerationBatchService();
