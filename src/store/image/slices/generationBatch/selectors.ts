import { GenerationBatch } from '@/types/generation';

import { ImageStoreState } from '../../initialState';

// ====== topic batch selectors ====== //

const generationBatchesByTopicId =
  (topicId?: string) =>
  (s: ImageStoreState): GenerationBatch[] => {
    if (!topicId) return [];
    return s.generationBatchesMap[topicId] || [];
  };

const isGenerationBatchLoading =
  (topicId?: string) =>
  (s: ImageStoreState): boolean => {
    if (!topicId) return false;
    return s.generationBatchLoadingIds.includes(topicId);
  };

// ====== aggregate selectors ====== //

export const generationBatchSelectors = {
  generationBatchesByTopicId,
  isGenerationBatchLoading,
};
