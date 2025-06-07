import { StateCreator } from 'zustand';

import { setNamespace } from '@/utils/storeDebug';

import { ImageStore } from '../../store';

const n = setNamespace('createImage');

// ====== action interface ====== //

export interface CreateImageAction {
  createImage: () => Promise<void>;
}

// ====== action implementation ====== //

export const createCreateImageSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  CreateImageAction
> = (set, get) => ({
  async createImage() {
    const { activeGenerationTopicId, createGenerationTopic, parameters } = get();
    if (!parameters) {
      throw new TypeError('parameters is not initialized');
    }

    if (!parameters.prompt) {
      throw new TypeError('prompt is empty');
    }

    // 1. Create generation topic if not exists
    let generationTopicId = activeGenerationTopicId;
    if (!generationTopicId) {
      const prompts = [parameters.prompt];
      generationTopicId = await createGenerationTopic(prompts);
    }
  },
});
