import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { chainSummaryGenerationTitle } from '@/chains/summaryGenerationTitle';
import { DEFAULT_SYSTEM_AGENT_ITEM } from '@/const/settings/systemAgent';
import { useClientDataSWR } from '@/libs/swr';
import { chatService } from '@/services/chat';
import { generationTopicService } from '@/services/generationTopic';
import { ImageGenerationTopic } from '@/types/generation';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { ImageStore } from '../../store';

const FETCH_GENERATION_TOPICS_KEY = 'fetchGenerationTopics';

const n = setNamespace('generationTopic');

export interface GenerationTopicAction {
  createGenerationTopic: (prompt: string) => Promise<string>;
  useFetchGenerationTopics: (
    enabled: boolean,
    isLogin: boolean | undefined,
  ) => SWRResponse<ImageGenerationTopic[]>;
  refreshGenerationTopics: () => Promise<void>;
}

export const createGenerationTopicSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationTopicAction
> = (set, get) => ({
  createGenerationTopic: async (prompt: string) => {
    const { refreshGenerationTopics } = get();

    // auto generate topic title from prompt by ai
    let title = '';
    await chatService.fetchPresetTaskResult({
      params: merge(DEFAULT_SYSTEM_AGENT_ITEM, chainSummaryGenerationTitle(prompt, 'image')),
      onError: () => {},
      onFinish: async (text) => {
        title = text;
      },
    });

    const generationTopicId = await generationTopicService.createTopic({ title });
    await refreshGenerationTopics();

    return generationTopicId;
  },

  useFetchGenerationTopics: (enabled, isLogin) =>
    useClientDataSWR<ImageGenerationTopic[]>(
      enabled ? [FETCH_GENERATION_TOPICS_KEY, isLogin] : null,
      () => generationTopicService.getAllGenerationTopics(),
      {
        suspense: true,
        onSuccess: (data) => {
          set({ generationTopics: data }, false, n('useFetchGenerationTopics'));
        },
      },
    ),

  refreshGenerationTopics: async () => {
    await mutate([FETCH_GENERATION_TOPICS_KEY, true]);
  },
});
