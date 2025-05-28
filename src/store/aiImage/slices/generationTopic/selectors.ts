import { GenerationTopicState } from '@/store/aiImage/slices/generationTopic/initialState';

const generationTopics = (s: GenerationTopicState) => s.generationTopics;

export const generationTopicSelectors = {
  generationTopics,
};
