import { isEqual } from 'lodash-es';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand';

import { useClientDataSWR } from '@/libs/swr';
import { GetGenerationStatusResult } from '@/server/routers/lambda/generation';
import { generationService } from '@/services/generation';
import { generationBatchService } from '@/services/generationBatch';
import { toggleBooleanList } from '@/store/chat/utils';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation, GenerationBatch } from '@/types/generation';
import { setNamespace } from '@/utils/storeDebug';

import { ImageStore } from '../../store';
import { generationTopicSelectors } from '../generationTopic/selectors';
import { GenerationBatchDispatch, generationBatchReducer } from './reducer';

type GenerationBatchWithAsyncTaskId = GenerationBatch & {
  generations: (Generation & { asyncTaskId?: string })[];
};

const n = setNamespace('generationBatch');

// ====== SWR key ====== //
const SWR_USE_FETCH_GENERATION_BATCHES = 'SWR_USE_FETCH_GENERATION_BATCHES';
const SWR_USE_CHECK_GENERATION_STATUS = 'SWR_USE_CHECK_GENERATION_STATUS';

// ====== action interface ====== //

export interface GenerationBatchAction {
  internal_dispatchGenerationBatch: (
    topicId: string,
    payload: GenerationBatchDispatch,
    action?: string,
  ) => void;
  internal_toggleGenerationBatchLoading: (topicId: string, loading: boolean) => void;
  refreshGenerationBatches: () => Promise<void>;
  useCheckGenerationStatus: (
    generationId: string,
    asyncTaskId: string,
    topicId: string,
    enable?: boolean,
  ) => SWRResponse<GetGenerationStatusResult>;
  useFetchGenerationBatches: (
    topicId?: string | null,
  ) => SWRResponse<GenerationBatchWithAsyncTaskId[]>;
}

// ====== action implementation ====== //

export const createGenerationBatchSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationBatchAction
> = (set, get) => ({
  internal_dispatchGenerationBatch: (topicId, payload, action) => {
    const currentBatches = get().generationBatchesMap[topicId] || [];
    const nextBatches = generationBatchReducer(currentBatches, payload);

    const nextMap = {
      ...get().generationBatchesMap,
      [topicId]: nextBatches,
    };

    // no need to update map if the map is the same
    if (isEqual(nextMap, get().generationBatchesMap)) return;

    set(
      {
        generationBatchesMap: nextMap,
      },
      false,
      action ?? n(`dispatchGenerationBatch/${payload.type}`),
    );
  },

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

  refreshGenerationBatches: async () => {
    const { activeGenerationTopicId } = get();
    if (activeGenerationTopicId) {
      await mutate([SWR_USE_FETCH_GENERATION_BATCHES, activeGenerationTopicId]);
    }
  },

  useCheckGenerationStatus: (generationId, asyncTaskId, topicId, enable = true) =>
    useClientDataSWR(
      enable && generationId && asyncTaskId
        ? [SWR_USE_CHECK_GENERATION_STATUS, generationId, asyncTaskId]
        : null,
      async ([, generationId, asyncTaskId]: [string, string, string]) => {
        return generationService.getGenerationStatus(generationId, asyncTaskId);
      },
      {
        refreshInterval: (data: GetGenerationStatusResult | undefined) => {
          // 如果状态是 success 或 error，停止轮询
          if (data?.status === AsyncTaskStatus.Success || data?.status === AsyncTaskStatus.Error) {
            return 0; // 停止轮询
          }
          // 否则每 2 秒轮询一次
          return 2000;
        },
        onSuccess: async (data: GetGenerationStatusResult) => {
          if (!data) return;

          // 找到对应的 batch，generation 数据库记录包含 generationBatchId
          const currentBatches = get().generationBatchesMap[topicId] || [];
          const targetBatch = currentBatches.find((batch) =>
            batch.generations.some((gen) => gen.id === generationId),
          );

          // 如果状态为成功或错误，都要更新对应的 generation
          if (
            (data.status === AsyncTaskStatus.Success || data.status === AsyncTaskStatus.Error) &&
            targetBatch
          ) {
            if (data.generation) {
              // 更新 generation 数据
              get().internal_dispatchGenerationBatch(
                topicId,
                {
                  type: 'updateGenerationInBatch',
                  batchId: targetBatch.id,
                  generationId,
                  value: data.generation,
                },
                n(
                  `useCheckGenerationStatus/${data.status === AsyncTaskStatus.Success ? 'success' : 'error'}`,
                ),
              );

              // 如果生成成功且有缩略图，检查当前 topic 是否有 imageUrl
              if (data.status === AsyncTaskStatus.Success && data.generation.asset?.thumbnailUrl) {
                const currentTopic =
                  generationTopicSelectors.getGenerationTopicById(topicId)(get());

                // 如果当前 topic 没有 imageUrl，使用这个 generation 的 thumbnailUrl 更新
                if (currentTopic && !currentTopic.imageUrl) {
                  await get().updateGenerationTopicImageUrl(
                    topicId,
                    data.generation.asset.thumbnailUrl,
                  );
                }
              }
            }

            // 在成功或失败后都要 refreshGenerationBatches
            await get().refreshGenerationBatches();
          }
        },
      },
    ),

  useFetchGenerationBatches: (topicId) =>
    useClientDataSWR<GenerationBatchWithAsyncTaskId[]>(
      topicId ? [SWR_USE_FETCH_GENERATION_BATCHES, topicId] : null,
      async ([, topicId]: [string, string]) => {
        return generationBatchService.getGenerationBatches(topicId);
      },
      {
        suspense: true,
        onSuccess: (data) => {
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
