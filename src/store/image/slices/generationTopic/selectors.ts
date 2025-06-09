import { ImageStoreState } from '../../initialState';
import { generationBatchSelectors } from '../generationBatch/selectors';

const activeGenerationTopicId = (s: ImageStoreState) => s.activeGenerationTopicId;
const generationTopics = (s: ImageStoreState) => s.generationTopics;
const getGenerationTopicById = (id: string) => (s: ImageStoreState) =>
  s.generationTopics.find((topic) => topic.id === id);
const isLoadingGenerationTopic = (id: string) => (s: ImageStoreState) =>
  s.loadingGenerationTopicIds.includes(id);
const getGenerationTopicThumbnailUrl = (id: string) => (s: ImageStoreState) => {
  const generationBatches = generationBatchSelectors.getGenerationBatchByTopicId(id)(s);
  const allThumbnailUrls = generationBatches.flatMap((batch) =>
    batch.generations.map((generation) => generation.asset?.thumbnailUrl).filter(Boolean),
  );
  return allThumbnailUrls.at(-1) || '';
};

export const generationTopicSelectors = {
  activeGenerationTopicId,
  generationTopics,
  getGenerationTopicById,
  isLoadingGenerationTopic,
  getGenerationTopicThumbnailUrl,
};
