import { useMemo } from 'react';

import { useAiImageStore } from '../../store';
import { StandardAiImageParametersKeys } from '../../utils/StandardAiImageParameters';
import { parametersSelector, paramsPropertiesSelector } from './selectors';

export function useGenerationConfigParam<N extends StandardAiImageParametersKeys>(paramName: N) {
  const parameters = useAiImageStore(parametersSelector);
  const paramsProperties = useAiImageStore(paramsPropertiesSelector);

  const paramValue = parameters?.[paramName];
  const paramSchema = paramsProperties?.[paramName];

  const { min, max, step, description } = useMemo(() => {
    const min = paramSchema && 'minimum' in paramSchema ? paramSchema.minimum : undefined;
    const max = paramSchema && 'maximum' in paramSchema ? paramSchema.maximum : undefined;
    const step = paramSchema && 'step' in paramSchema ? paramSchema.step : undefined;
    const description =
      paramSchema && 'description' in paramSchema ? paramSchema.description : undefined;

    return {
      description,
      max,
      min,
      step,
    };
  }, [paramSchema]);

  return {
    description,
    max,
    min,
    step,
    value: paramValue,
  };
}
