/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import FluxSchnellSchema from '@/config/paramsSchemas/fal/flux-schnell.json';
import { ModelProvider } from '@/libs/model-runtime/types/type';

import { StandardAiImageParameters } from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export const DEFAULT_AI_IMAGE_PROVIDER = ModelProvider.Fal;
export const DEFAULT_AI_IMAGE_MODEL = 'flux/schnell';

export interface GenerationConfigState {
  model: string;
  provider: string;
  /**
   * store the params pass the generation api
   */
  parameters?: Partial<StandardAiImageParameters>;
  parameterSchema?: Record<string, any>;
}

export const DEFAULT_IMAGE_GENERATION_PARAMETERS: Partial<StandardAiImageParameters> =
  parseParamsSchema(FluxSchnellSchema).defaultValues;

export const initialGenerationConfigState: GenerationConfigState = {
  model: DEFAULT_AI_IMAGE_MODEL,
  provider: DEFAULT_AI_IMAGE_PROVIDER,
  parameters: DEFAULT_IMAGE_GENERATION_PARAMETERS,
  parameterSchema: FluxSchnellSchema,
};
