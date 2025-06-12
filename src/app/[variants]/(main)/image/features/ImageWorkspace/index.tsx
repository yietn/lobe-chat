'use client';

import { Center, Flexbox } from 'react-layout-kit';

import GenerationFeed from '@/app/[variants]/(main)/image/features/GenerationFeed';
import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';
import { useImageStore } from '@/store/image';
import { generationBatchSelectors } from '@/store/image/slices/generationBatch/selectors';

const ImageWorkspace = () => {
  const currentBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);
  const hasGenerations = currentBatches && currentBatches.length > 0;

  return (
    <Flexbox flex={1} height="100%">
      {hasGenerations ? (
        <>
          {/* 生成结果展示区 */}
          <Flexbox flex={1} padding={24} style={{ overflowY: 'auto' }}>
            <GenerationFeed />
          </Flexbox>

          {/* 底部输入框 */}
          <Center style={{ marginBottom: 64 }}>
            <PromptInput />
          </Center>
        </>
      ) : (
        // 当没有生成结果时，将输入框完整居中显示
        <Center flex={1} padding={24}>
          <PromptInput />
        </Center>
      )}
    </Flexbox>
  );
};

export default ImageWorkspace;
