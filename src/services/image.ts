import debug from 'debug';

import { lambdaClient } from '@/libs/trpc/client';
import { CreateImageServicePayload } from '@/server/routers/lambda/image';

// Create debug logger
const log = debug('lobe-image:service');

export class AiImageService {
  constructor(private readonly userId: string) {
    log('AiImageService initialized for user: %s', userId);
  }

  async createImage(payload: CreateImageServicePayload) {
    log('Creating image with payload: %O', {
      userId: this.userId,
      generationTopicId: payload.generationTopicId,
      provider: payload.provider,
      model: payload.model,
      prompt: payload.params.prompt,
      imageParams: {
        width: payload.params.width,
        height: payload.params.height,
        steps: payload.params.steps,
      },
    });

    try {
      const result = await lambdaClient.image.createImage.mutate(payload);

      log('Image creation service call completed successfully: %O', {
        userId: this.userId,
        success: result.success,
        batchId: result.data?.batch?.id,
        generationCount: result.data?.generations?.length,
      });

      return result;
    } catch (error) {
      log('Image creation service call failed: %O', {
        userId: this.userId,
        error: (error as Error).message,
        payload: {
          generationTopicId: payload.generationTopicId,
          provider: payload.provider,
          model: payload.model,
        },
      });

      throw error;
    }
  }
}
