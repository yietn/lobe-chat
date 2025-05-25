import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

const parametersSelector = (s: GenerationConfigState) => s.parameters;
const paramsSchemaSelector = (s: GenerationConfigState) => s.parameterSchema;
const paramsPropertiesSelector = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchemaSelector(s);
  return _paramsSchema ? parseParamsSchema(_paramsSchema).properties : undefined;
};

export { parametersSelector, paramsPropertiesSelector, paramsSchemaSelector };
