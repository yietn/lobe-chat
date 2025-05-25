/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import FluxSchnellSchema from '@/config/paramsSchemas/fal/flux-schnell.json';

import { StandardAiImageParameters } from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export interface GenerationConfigState {
  /**
   * store the params pass the generation api
   */
  parameters?: Partial<StandardAiImageParameters>;
  parameterSchema?: Record<string, any>;
}

export const DEFAULT_IMAGE_GENERATION_PARAMETERS: Partial<StandardAiImageParameters> =
  parseParamsSchema(FluxSchnellSchema).defaultValues;

export const initialGenerationConfigState: GenerationConfigState = {
  parameters: DEFAULT_IMAGE_GENERATION_PARAMETERS,
  parameterSchema: FluxSchnellSchema,
};
