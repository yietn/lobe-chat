'use client';

import { PreviewGroup } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';
import ImageItem from '@/components/ImageItem';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/selectors';
import { generationBatchSelectors } from '@/store/image/slices/generationBatch/selectors';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { GenerationBatch } from '@/types/generation';

// 扩展 dayjs 插件
dayjs.extend(relativeTime);

const useStyles = createStyles(({ css, token }) => ({
  batchContainer: css`
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  batchHeader: css`
    margin-bottom: 12px;
  `,
  prompt: css`
    font-weight: 500;
    color: ${token.colorText};
    margin-bottom: 4px;
    word-break: break-word;
    line-height: 1.4;
  `,
  metadata: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `,
  metadataItem: css`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  skeletonContainer: css`
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
}));

// Batch item component
const BatchItem = memo<{ batch: GenerationBatch }>(({ batch }) => {
  const { styles } = useStyles();

  const imageItems = useMemo(() => {
    return batch.generations.map((generation) => ({
      id: generation.id,
      url: generation.asset?.url || '',
      alt: batch.prompt,
      loading:
        generation.task.status === AsyncTaskStatus.Pending ||
        generation.task.status === AsyncTaskStatus.Processing,
    }));
  }, [batch.generations, batch.prompt]);

  const timeAgo = useMemo(() => {
    return dayjs(batch.createdAt).fromNow();
  }, [batch.createdAt]);

  if (imageItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.batchContainer}>
      <div className={styles.batchHeader}>
        <div className={styles.prompt}>{batch.prompt}</div>
        <div className={styles.metadata}>
          <span className={styles.metadataItem}>
            <span>{batch.provider}</span>
            <span>•</span>
            <span>{batch.model}</span>
          </span>
          {batch.width && batch.height && (
            <span className={styles.metadataItem}>
              <span>
                {batch.width} × {batch.height}
              </span>
            </span>
          )}
          <span className={styles.metadataItem}>
            <span>{timeAgo}</span>
          </span>
          <span className={styles.metadataItem}>
            <span>{imageItems.length} 张图片</span>
          </span>
        </div>
      </div>

      <PreviewGroup>
        <GalleyGrid items={imageItems} renderItem={ImageItem} />
      </PreviewGroup>
    </div>
  );
});

// Main GenerationBatchList component
const GenerationBatchList = memo(() => {
  const activeTopicId = useImageStore(generationTopicSelectors.activeGenerationTopicId);
  const useFetchGenerationBatches = useImageStore((s) => s.useFetchGenerationBatches);
  useFetchGenerationBatches(activeTopicId);

  const currentGenerationBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);

  if (!currentGenerationBatches || currentGenerationBatches.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={16} width="100%">
      {currentGenerationBatches.map((batch) => (
        <BatchItem batch={batch} key={batch.id} />
      ))}
    </Flexbox>
  );
});

GenerationBatchList.displayName = 'GenerationBatchList';

export default GenerationBatchList;
