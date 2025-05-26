import { StandardAiImageParametersKeys } from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

const parameters = (s: GenerationConfigState) => s.parameters;
const paramsSchema = (s: GenerationConfigState) => s.parameterSchema;
const paramsProperties = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchema(s);
  return _paramsSchema ? parseParamsSchema(_paramsSchema).properties : undefined;
};
const isSupportParam = (paramName: StandardAiImageParametersKeys) => {
  return (s: GenerationConfigState) => {
    const _paramsProperties = paramsProperties(s);
    return Boolean(_paramsProperties && paramName in _paramsProperties);
  };
};

export const aiImageGenerationConfigSelectors = {
  isSupportParam,
  parameters,
  paramsProperties,
  paramsSchema,
};
