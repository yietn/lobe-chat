import { GenerationTopicState } from '@/store/aiImage/slices/generationTopic/initialState';

const currentGenerationTopic = (s: GenerationTopicState) => s.generationTopicMap[s.activeId];

export const generationTopicSelectors = {
  currentGenerationTopic,
};
