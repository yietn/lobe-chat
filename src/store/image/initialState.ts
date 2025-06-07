import {
  GenerationBatchState,
  initialGenerationBatchState,
} from './slices/generationBatch/initialState';
import {
  GenerationConfigState,
  initialGenerationConfigState,
} from './slices/generationConfig/initialState';
import {
  GenerationTopicState,
  initialGenerationTopicState,
} from './slices/generationTopic/initialState';

export type ImageStoreState = GenerationConfigState & GenerationTopicState & GenerationBatchState;

export const initialState: ImageStoreState = {
  ...initialGenerationConfigState,
  ...initialGenerationTopicState,
  ...initialGenerationBatchState,
};
