import {
  GenerationConfigState,
  initialGenerationConfigState,
} from './slices/generationConfig/initialState';

export type AiImageStoreState = GenerationConfigState;

export const initialState: AiImageStoreState = {
  ...initialGenerationConfigState,
};
