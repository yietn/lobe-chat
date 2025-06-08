import { lambdaClient } from '@/libs/trpc/client';

class GenerationService {
  async getGenerationStatus(generationId: string, asyncTaskId: string) {
    return lambdaClient.generation.getGenerationStatus.query({ generationId, asyncTaskId });
  }
}

export const generationService = new GenerationService();
