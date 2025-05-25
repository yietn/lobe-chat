import { StandardAiImageParametersKeys } from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

const parametersSelector = (s: GenerationConfigState) => s.parameters;
const paramsSchemaSelector = (s: GenerationConfigState) => s.parameterSchema;
const paramsPropertiesSelector = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchemaSelector(s);
  return _paramsSchema ? parseParamsSchema(_paramsSchema).properties : undefined;
};
const isSupportParamSelectorCreator = (paramName: StandardAiImageParametersKeys) => {
  return (s: GenerationConfigState) => {
    const paramsProperties = paramsPropertiesSelector(s);
    return Boolean(paramsProperties && paramName in paramsProperties);
  };
};

export {
  isSupportParamSelectorCreator,
  parametersSelector,
  paramsPropertiesSelector,
  paramsSchemaSelector,
};
