'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Icon, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { omit } from 'lodash-es';
import { AlertTriangle, Loader2, Settings, Trash2 } from 'lucide-react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ImageItem from '@/components/ImageItem';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/selectors';
import { generationBatchSelectors } from '@/store/image/slices/generationBatch/selectors';
import { StdImageGenParams } from '@/store/image/utils/StandardParameters';
import { AsyncTaskStatus } from '@/types/asyncTask';
import { Generation, GenerationBatch } from '@/types/generation';

import { ElapsedTime } from './ElapsedTime';

// 扩展 dayjs 插件
dayjs.extend(relativeTime);

// 计算图片的显示尺寸，保持原图比例
const calculateImageSize = (generation: Generation) => {
  const asset = generation.asset;
  if (!asset?.width || !asset?.height) {
    // 如果没有尺寸信息，使用默认尺寸
    return { width: 200, height: 200 };
  }

  const maxHeight = 200; // 最大高度
  const aspectRatio = asset.width / asset.height;

  let width = maxHeight * aspectRatio;
  let height = maxHeight;

  // 如果宽度太大，限制宽度并调整高度
  const maxWidth = 300;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

const useStyles = createStyles(({ css, token }) => ({
  batchContainer: css`
    position: relative;
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
  batchActions: css`
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-start;
  `,
  actionButton: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    cursor: pointer;
    color: ${token.colorTextSecondary};
    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillSecondary};
      color: ${token.colorText};
      border-color: ${token.colorBorder};
    }

    &.delete-button:hover {
      background: ${token.colorErrorBg};
      color: ${token.colorError};
      border-color: ${token.colorError};
    }
  `,
  imageGrid: css`
    display: flex;
    gap: 8px;
    width: 100%;
    overflow-x: auto;

    /* Hide scrollbar for webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
  `,
  imageContainer: css`
    position: relative;
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;

    &:hover .generation-delete {
      opacity: 1;
    }
  `,
  generationDelete: css`
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    width: 24px;
    height: 24px;
    border: none;
    background: ${token.colorBgContainer};
    border-radius: 50%;
    cursor: pointer;
    color: ${token.colorTextSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: ${token.boxShadow};
    border: 1px solid ${token.colorBorderSecondary};

    &:hover {
      background: ${token.colorErrorBg};
      color: ${token.colorError};
      border-color: ${token.colorError};
    }
  `,
  placeholderContainer: css`
    position: relative;
    flex-shrink: 0;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${token.colorFillSecondary};
    border: 1px solid ${token.colorBorder};

    &:hover .generation-delete {
      opacity: 1;
    }
  `,
  loadingContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${token.colorTextTertiary};
    font-size: 12px;
  `,
  errorContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${token.colorError};
    font-size: 12px;
    text-align: center;
    padding: 8px;
  `,
  spinIcon: css`
    color: ${token.colorPrimary};
  `,
  errorIcon: css`
    color: ${token.colorError};
  `,
}));

// Generation item component
const GenerationItem = memo<{
  generation: Generation;
  prompt: string;
}>(({ generation, prompt }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const useCheckGenerationStatus = useImageStore((s) => s.useCheckGenerationStatus);
  const deleteGeneration = useImageStore((s) => s.deleteGeneration);
  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);

  const isFinalized =
    generation.task.status === AsyncTaskStatus.Success ||
    generation.task.status === AsyncTaskStatus.Error;

  const shouldPoll = !isFinalized;
  useCheckGenerationStatus(generation.id, generation.task.id, activeTopicId!, shouldPoll);

  const imageSize = calculateImageSize(generation);

  const handleDeleteGeneration = async () => {
    try {
      await deleteGeneration(generation.id);
    } catch (error) {
      console.error('Failed to delete generation:', error);
    }
  };

  // 如果生成成功且有图片 URL，显示图片
  if (generation.task.status === AsyncTaskStatus.Success && generation.asset?.url) {
    return (
      <div className={styles.imageContainer} style={{ ...imageSize }}>
        <ImageItem
          alt={prompt}
          preview={{
            src: generation.asset.thumbnailUrl,
          }}
          style={{ width: '100%', height: '100%' }}
          url={generation.asset.url}
        />
        <Tooltip title={t('generation.actions.delete')}>
          <button
            className={`${styles.generationDelete} generation-delete`}
            onClick={handleDeleteGeneration}
            type="button"
          >
            <Icon icon={Trash2} size={14} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // 如果生成失败，显示错误状态
  if (generation.task.status === AsyncTaskStatus.Error) {
    return (
      <div className={styles.placeholderContainer} style={{ ...imageSize }}>
        <div className={styles.errorContent}>
          <Icon className={styles.errorIcon} icon={AlertTriangle} size={20} />
          <div>{t('generation.status.failed')}</div>
          {generation.task.error && (
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {typeof generation.task.error.body === 'string'
                ? generation.task.error.body
                : generation.task.error.body?.detail ||
                  generation.task.error.name ||
                  'Unknown error'}
            </div>
          )}
        </div>
        <Tooltip title={t('generation.actions.delete')}>
          <button
            className={`${styles.generationDelete} generation-delete`}
            onClick={handleDeleteGeneration}
            type="button"
          >
            <Icon icon={Trash2} size={14} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // 否则显示 loading 状态（Processing 或 Pending）
  const isGenerating =
    generation.task.status === AsyncTaskStatus.Processing ||
    generation.task.status === AsyncTaskStatus.Pending;

  return (
    <div className={styles.placeholderContainer} style={{ ...imageSize }}>
      <div className={styles.loadingContent}>
        <Icon className={styles.spinIcon} icon={Loader2} size={20} spin />
        <div>{t('generation.status.generating')}</div>
        <ElapsedTime generationId={generation.id} isActive={isGenerating} />
      </div>
      <Tooltip title={t('generation.actions.delete')}>
        <button
          className={`${styles.generationDelete} generation-delete`}
          onClick={handleDeleteGeneration}
          type="button"
        >
          <Icon icon={Trash2} size={14} />
        </button>
      </Tooltip>
    </div>
  );
});

// Batch item component
const BatchItem = memo<{ batch: GenerationBatch }>(({ batch }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);
  const deleteGenerationBatch = useImageStore((s) => s.deleteGenerationBatch);
  const reuseSettings = useImageStore((s) => s.reuseSettings);
  const [imageGridRef] = useAutoAnimate();

  const timeAgo = useMemo(() => {
    return dayjs(batch.createdAt).fromNow();
  }, [batch.createdAt]);

  const handleBatchSettings = () => {
    reuseSettings(omit(batch.config as StdImageGenParams, ['seed']));
  };

  const handleDeleteBatch = async () => {
    if (!activeTopicId) return;

    try {
      await deleteGenerationBatch(batch.id, activeTopicId);
    } catch (error) {
      console.error('Failed to delete batch:', error);
    }
  };

  if (batch.generations.length === 0) {
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
            <span>{t('generation.metadata.count', { count: batch.generations.length })}</span>
          </span>
        </div>
      </div>

      <div className={styles.imageGrid} ref={imageGridRef}>
        {batch.generations.map((generation) => (
          <GenerationItem generation={generation} key={generation.id} prompt={batch.prompt} />
        ))}
      </div>

      <div className={styles.batchActions}>
        <Tooltip title={t('generation.actions.reuseSettings')}>
          <button className={styles.actionButton} onClick={handleBatchSettings} type="button">
            <Icon icon={Settings} size={16} />
          </button>
        </Tooltip>
        <Tooltip title={t('generation.actions.deleteBatch')}>
          <button
            className={`${styles.actionButton} delete-button`}
            onClick={handleDeleteBatch}
            type="button"
          >
            <Icon icon={Trash2} size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
});

// Main GenerationBatchList component
const GenerationBatchList = memo(() => {
  const [parent, enableAnimations] = useAutoAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevBatchesCountRef = useRef(0);
  const activeTopicId = useImageStore(generationTopicSelectors.activeGenerationTopicId);
  const useFetchGenerationBatches = useImageStore((s) => s.useFetchGenerationBatches);
  useFetchGenerationBatches(activeTopicId);

  const currentGenerationBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);

  // Auto-scroll to bottom, with different behavior for initial load vs. updates
  useEffect(() => {
    const currentBatches = currentGenerationBatches || [];
    const currentBatchesCount = currentBatches.length;
    const prevBatchesCount = prevBatchesCountRef.current;

    if (currentBatchesCount === 0) {
      prevBatchesCountRef.current = 0;
      return;
    }

    if (isInitialLoadRef.current) {
      // On initial load, scroll instantly to the end.
      containerRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      isInitialLoadRef.current = false;
    } else if (currentBatchesCount > prevBatchesCount) {
      // For subsequent updates where a batch was ADDED, scroll smoothly.
      enableAnimations(false);
      // Wait for React to re-render without animations.
      const timer = setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
        // Re-enable animations for future interactions like deleting items.
        enableAnimations(true);
      }, 50); // A small delay is enough.

      return () => clearTimeout(timer);
    }

    // Always update the ref with the latest count for the next render.
    prevBatchesCountRef.current = currentBatchesCount;
  }, [currentGenerationBatches, enableAnimations]);

  if (!currentGenerationBatches || currentGenerationBatches.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={16} ref={parent} width="100%">
      {currentGenerationBatches.map((batch) => (
        <BatchItem batch={batch} key={batch.id} />
      ))}
      {/* Invisible element for scroll target */}
      <div ref={containerRef} style={{ height: 1 }} />
    </Flexbox>
  );
});

GenerationBatchList.displayName = 'GenerationBatchList';

export default GenerationBatchList;
