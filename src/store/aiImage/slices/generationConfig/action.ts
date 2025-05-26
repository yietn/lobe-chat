import { StateCreator } from 'zustand/vanilla';

import { AIImageModelCard } from '@/types/aiModel';

import type { AiImageStore } from '../../store';
import {
  StandardAiImageParameters,
  StandardAiImageParametersKeys,
} from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export interface GenerationConfigAction {
  setParamOnInput<K extends StandardAiImageParametersKeys>(
    paramName: K,
    value: StandardAiImageParameters[K],
  ): void;

  setModelAndProviderOnSelect(model: string, provider: string): void;

  updateParamsWhenModelChange(model: AIImageModelCard): void;
}

export const createGenerationConfigSlice: StateCreator<
  AiImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationConfigAction
> = (set) => ({
  setParamOnInput: (paramName, value) => {
    set(
      (state) => {
        const parameters = state.parameters;
        if (!parameters) throw new Error('parameters is not initialized');

        return { parameters: { ...parameters, [paramName]: value } };
      },
      false,
      `setParamOnInput/${paramName}`,
    );
  },

  setModelAndProviderOnSelect: (model, provider) => {
    set(() => ({ model, provider }), false, `setModelAndProviderOnSelect/${model}/${provider}`);
  },

  updateParamsWhenModelChange: (model: AIImageModelCard) => {
    console.log('updateParamsWhenModelChange', model);
    const { defaultValues } = parseParamsSchema(model.parameters!);
    set(
      () => ({ parameters: defaultValues, parameterSchema: model.parameters }),
      false,
      `updateParamsWhenModelChange/${model.id}`,
    );
  },
});
