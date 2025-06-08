import { GenerationTopicState } from '@/store/image/slices/generationTopic/initialState';

const activeGenerationTopicId = (s: GenerationTopicState) => s.activeGenerationTopicId;
const generationTopics = (s: GenerationTopicState) => s.generationTopics;
const getGenerationTopicById = (id: string) => (s: GenerationTopicState) =>
  s.generationTopics.find((topic) => topic.id === id);
const isLoadingGenerationTopic = (id: string) => (s: GenerationTopicState) =>
  s.loadingGenerationTopicIds.includes(id);

export const generationTopicSelectors = {
  activeGenerationTopicId,
  generationTopics,
  getGenerationTopicById,
  isLoadingGenerationTopic,
};
