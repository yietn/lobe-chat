import { ImageGenerationTopic } from '@/types/generation';

interface CreateTopicParams {
  title: string;
}

export interface IGenerationTopicService {
  getAllGenerationTopics(): Promise<ImageGenerationTopic[]>;
  createTopic(params: CreateTopicParams): Promise<string>;
}
