import { AiImageGenerationTopic } from '@/types/aiImage';

export interface IGenerationTopicService {
  getAllGenerationTopics(): Promise<AiImageGenerationTopic[]>;
  createTopic(): Promise<string>;
}
