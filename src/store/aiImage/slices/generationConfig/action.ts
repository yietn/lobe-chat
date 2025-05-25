import { StateCreator } from 'zustand/vanilla';

import type { AiImageStore } from '../../store';
import {
  StandardAiImageParameters,
  StandardAiImageParametersKeys,
} from '../../utils/StandardAiImageParameters';

export interface GenerationConfigAction {
  setParamOnInput<K extends StandardAiImageParametersKeys>(
    paramName: K,
    value: StandardAiImageParameters[K],
  ): void;
}

export const createGenerationConfigSlice: StateCreator<
  AiImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationConfigAction
> = (set, get) => ({
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
});
