import { AiImageGenerationTopic } from '@/types/aiImage';

export interface GenerationTopicState {
  activeGenerationTopicId: string | null;
  generationTopics: AiImageGenerationTopic[];
}

export const initialGenerationTopicState: GenerationTopicState = {
  activeGenerationTopicId: null,
  generationTopics: [],
};
