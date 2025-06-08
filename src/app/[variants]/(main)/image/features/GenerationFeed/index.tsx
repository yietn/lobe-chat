'use client';

import { PreviewGroup } from '@lobehub/ui';
import { Skeleton } from 'antd';
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

// Skeleton component for loading state
const BatchSkeleton = memo(() => {
  const { styles } = useStyles();

  return (
    <div className={styles.skeletonContainer}>
      <Flexbox gap={12}>
        <Skeleton.Button active style={{ width: '80%', height: 20 }} />
        <Skeleton.Button active style={{ width: '60%', height: 16 }} />
        <Flexbox gap={6}>
          <Skeleton.Button active style={{ width: 120, height: 120 }} />
          <Skeleton.Button active style={{ width: 120, height: 120 }} />
          <Skeleton.Button active style={{ width: 120, height: 120 }} />
          <Skeleton.Button active style={{ width: 120, height: 120 }} />
        </Flexbox>
      </Flexbox>
    </div>
  );
});

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

// Main GenerationFeed component
const GenerationFeed = memo(() => {
  const activeTopicId = useImageStore(generationTopicSelectors.activeGenerationTopicId);
  console.log('GenerationFeed.activeTopicId', activeTopicId);
  const useFetchGenerationBatches = useImageStore((s) => s.useFetchGenerationBatches);
  useFetchGenerationBatches(activeTopicId);

  const currentGenerationBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);
  const isCurrentGenerationBatchLoading = useImageStore(
    generationBatchSelectors.isCurrentGenerationBatchLoading,
  );

  if (isCurrentGenerationBatchLoading) {
    return (
      <Flexbox gap={16} width="100%">
        {Array.from({ length: 3 }).map((_, index) => (
          <BatchSkeleton key={index} />
        ))}
      </Flexbox>
    );
  }

  if (!currentGenerationBatches || currentGenerationBatches.length === 0) {
    return (
      <Flexbox align="center" gap={16} justify="center" style={{ minHeight: 200 }} width="100%">
        <div style={{ textAlign: 'center', color: '#999' }}>暂无生成记录</div>
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={16} width="100%">
      {currentGenerationBatches.map((batch) => (
        <BatchItem batch={batch} key={batch.id} />
      ))}
    </Flexbox>
  );
});

GenerationFeed.displayName = 'GenerationFeed';

export default GenerationFeed;
