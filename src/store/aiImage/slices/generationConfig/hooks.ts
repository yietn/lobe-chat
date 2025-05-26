import { useCallback, useMemo } from 'react';

import { useAiImageStore } from '../../store';
import {
  StandardAiImageParameters,
  StandardAiImageParametersKeys,
} from '../../utils/StandardAiImageParameters';
import { aiImageGenerationConfigSelectors } from './selectors';

export function useGenerationConfigParam<N extends StandardAiImageParametersKeys>(paramName: N) {
  type ValueType = StandardAiImageParameters[N];

  const parameters = useAiImageStore(aiImageGenerationConfigSelectors.parameters);
  const paramsProperties = useAiImageStore(aiImageGenerationConfigSelectors.paramsProperties);

  const paramValue = parameters?.[paramName] as ValueType;
  const setParamsValue = useAiImageStore((s) => s.setParamOnInput<N>);
  const setValue = useCallback(
    (value: ValueType) => {
      setParamsValue(paramName, value);
    },
    [paramName, setParamsValue],
  );

  const paramSchema = paramsProperties?.[paramName];
  const { description, min, max, step } = useMemo(() => {
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
    value: paramValue,
    setValue,
    description,
    min,
    max,
    step,
  };
}
