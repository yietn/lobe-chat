import { BLANK_GENERATION_TOPIC_ID } from '@/const/aiImage';
import { AiImageGenerationTopic } from '@/types/aiImage';

export interface GenerationTopicState {
  activeId: string;
  generationTopicInitMap: Record<string, boolean>;
  generationTopicMap: Record<string, AiImageGenerationTopic>;
  isBlankGenerationTopicInit: boolean;
}

export const initialGenerationTopicState: GenerationTopicState = {
  activeId: BLANK_GENERATION_TOPIC_ID,
  generationTopicInitMap: {},
  generationTopicMap: {},
  isBlankGenerationTopicInit: false,
};
