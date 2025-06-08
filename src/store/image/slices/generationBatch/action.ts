import { isEqual } from 'lodash-es';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand';

import { useClientDataSWR } from '@/libs/swr';
import { generationBatchService } from '@/services/generationBatch';
import { toggleBooleanList } from '@/store/chat/utils';
import { GenerationBatch } from '@/types/generation';
import { setNamespace } from '@/utils/storeDebug';

import { ImageStore } from '../../store';

const n = setNamespace('generationBatch');

// ====== SWR key ====== //
const SWR_USE_FETCH_GENERATION_BATCHES = 'SWR_USE_FETCH_GENERATION_BATCHES';

// ====== action interface ====== //

export interface GenerationBatchAction {
  internal_toggleGenerationBatchLoading: (topicId: string, loading: boolean) => void;
  useFetchGenerationBatches: (topicId?: string | null) => SWRResponse<GenerationBatch[]>;
}

// ====== action implementation ====== //

export const createGenerationBatchSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationBatchAction
> = (set, get) => ({
  internal_toggleGenerationBatchLoading: (topicId, loading) => {
    set(
      {
        generationBatchLoadingIds: toggleBooleanList(
          get().generationBatchLoadingIds,
          topicId,
          loading,
        ),
      },
      false,
      n(`internal_toggleGenerationBatchLoading/${loading ? 'start' : 'end'}`),
    );
  },

  useFetchGenerationBatches: (topicId) =>
    useClientDataSWR<GenerationBatch[]>(
      topicId ? [SWR_USE_FETCH_GENERATION_BATCHES, topicId] : null,
      async ([, topicId]: [string, string]) => {
        return generationBatchService.getGenerationBatches(topicId);
      },
      {
        suspense: true,
        onSuccess: (data) => {
          console.log('GenerationBatchAction.useFetchGenerationBatches.onSuccess', data);

          const nextMap = {
            ...get().generationBatchesMap,
            [topicId!]: data,
          };

          // no need to update map if the map is the same
          if (isEqual(nextMap, get().generationBatchesMap)) return;

          set(
            {
              generationBatchesMap: nextMap,
            },
            false,
            n('useFetchGenerationBatches(success)', { topicId }),
          );
        },
      },
    ),
});
