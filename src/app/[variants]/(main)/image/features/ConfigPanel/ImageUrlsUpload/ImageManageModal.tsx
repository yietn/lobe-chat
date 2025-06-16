'use client';

import { Button, Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Upload, X } from 'lucide-react';
import React, { type FC, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ======== Types ======== //

/**
 * 统一的图片项数据结构
 * - url: 现有图片的远程URL
 * - file: 新选择的文件，需要上传
 * 有url的是现有图片，有file的是待上传文件
 */
export interface ImageItem {
  id: string;
  url?: string; // 现有图片的URL
  file?: File; // 新选择的文件
}

interface ImageManageModalProps {
  open: boolean;
  images: string[]; // 现有图片URL数组
  onClose: () => void;
  onComplete: (imageItems: ImageItem[]) => void; // 统一的完成回调
}

// ======== Utils ======== //

const getFileName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'image.jpg';
  } catch {
    return 'image.jpg';
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// ======== Styles ======== //

const useStyles = createStyles(({ css, token }) => ({
  modal: css`
    .ant-modal-content {
      padding: 0;
      overflow: hidden;
    }
  `,
  content: css`
    display: flex;
    height: 480px;
    background: ${token.colorBgContainer};
  `,
  sidebar: css`
    width: 200px;
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: 16px;
    overflow-y: auto;
    background: ${token.colorBgLayout};
  `,
  thumbnailList: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  thumbnail: css`
    position: relative;
    width: 100%;
    height: 120px;
    border-radius: ${token.borderRadius}px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
    }

    &:hover .thumbnail-delete {
      opacity: 1;
    }

    &.selected {
      border-color: ${token.colorPrimary};
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  `,
  thumbnailDelete: css`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;

    background: ${token.colorBgMask};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    color: ${token.colorTextLightSolid};
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
    z-index: 10;

    &:hover {
      background: ${token.colorErrorBg};
      color: ${token.colorError};
    }
  `,
  newFileIndicator: css`
    position: absolute;
    top: 4px;
    left: 4px;
    padding: 2px 6px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorSuccess};
    color: ${token.colorWhite};
    font-size: 10px;
    font-weight: 500;
    z-index: 5;
  `,
  previewArea: css`
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  `,
  previewImage: css`
    max-width: 100%;
    max-height: 320px;
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowSecondary};
  `,
  previewEmpty: css`
    color: ${token.colorTextSecondary};
    font-size: 16px;
  `,
  fileName: css`
    margin-top: 16px;
    padding: 8px 12px;
    background: ${token.colorFillSecondary};
    border-radius: ${token.borderRadius}px;
    color: ${token.colorTextSecondary};
    font-size: 12px;
    font-family: ${token.fontFamilyCode};
  `,
  footer: css`
    padding: 16px 24px;
    border-top: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
}));

// ======== Main Component ======== //

const ImageManageModal: FC<ImageManageModalProps> = memo(
  ({ open, images, onClose, onComplete }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('components');
    const inputRef = useRef<HTMLInputElement>(null);

    // 使用统一的数据结构管理所有图片
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    // Modal 打开时初始化状态
    useEffect(() => {
      if (open) {
        // 将现有URL转换为ImageItem格式
        const initialItems: ImageItem[] = images.map((url) => ({
          id: generateId(),
          url,
        }));
        setImageItems(initialItems);
        setSelectedIndex(0);
      }
    }, [open, images]);

    // Modal 关闭时清理blob URL
    useEffect(() => {
      if (!open) {
        imageItems.forEach((item) => {
          if (item.file) {
            // 清理新上传文件的预览URL
            const previewUrl = URL.createObjectURL(item.file);
            URL.revokeObjectURL(previewUrl);
          }
        });
      }
    }, [open, imageItems]);

    const selectedItem = imageItems[selectedIndex];

    const handleDelete = (index: number) => {
      const newItems = imageItems.filter((_, i) => i !== index);
      setImageItems(newItems);

      // 调整选中索引
      if (selectedIndex >= newItems.length) {
        setSelectedIndex(Math.max(0, newItems.length - 1));
      }
    };

    const handleThumbnailDelete = (index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      handleDelete(index);
    };

    const handleUpload = () => {
      inputRef.current?.click();
    };

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // 创建新的ImageItem，只有file没有url
      const newItems: ImageItem[] = Array.from(files).map((file) => ({
        id: generateId(),
        file,
      }));

      setImageItems((prev) => [...prev, ...newItems]);
    };

    const handleComplete = () => {
      // 直接传递当前完整状态给父组件处理
      onComplete(imageItems);
      onClose();
    };

    const getDisplayUrl = (item: ImageItem): string => {
      if (item.url) {
        return item.url;
      } else if (item.file) {
        return URL.createObjectURL(item.file);
      }
      return '';
    };

    const getDisplayFileName = (item: ImageItem): string => {
      if (item.file) {
        return item.file.name;
      } else if (item.url) {
        return getFileName(item.url);
      }
      return '';
    };

    const renderThumbnail = (item: ImageItem, index: number) => {
      const displayUrl = getDisplayUrl(item);
      const isNewFile = Boolean(item.file);

      return (
        <div
          className={`${styles.thumbnail} ${index === selectedIndex ? 'selected' : ''}`}
          key={item.id}
          onClick={() => setSelectedIndex(index)}
        >
          <img
            alt={`Image ${index + 1}`}
            src={displayUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* 新文件标识 */}
          {isNewFile && (
            <div className={styles.newFileIndicator}>
              {t('MultiImagesUpload.modal.newFileIndicator')}
            </div>
          )}

          {/* 删除按钮 */}
          <div
            className={`${styles.thumbnailDelete} thumbnail-delete`}
            onClick={(e) => handleThumbnailDelete(index, e)}
          >
            <X size={12} />
          </div>
        </div>
      );
    };

    return (
      <Modal
        centered
        className={styles.modal}
        footer={null}
        onCancel={onClose}
        open={open}
        title={t('MultiImagesUpload.modal.title', { count: imageItems.length })}
        width={720}
      >
        {/* Hidden file input */}
        <input
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          onClick={(e) => {
            e.currentTarget.value = '';
          }}
          ref={inputRef}
          style={{ display: 'none' }}
          type="file"
        />

        {/* Content */}
        <div className={styles.content}>
          {/* Sidebar - Thumbnail List */}
          <div className={styles.sidebar}>
            <div className={styles.thumbnailList}>{imageItems.map(renderThumbnail)}</div>
          </div>

          {/* Preview Area */}
          <div className={styles.previewArea}>
            {selectedItem ? (
              <>
                <img
                  alt="Preview"
                  className={styles.previewImage}
                  src={getDisplayUrl(selectedItem)}
                />
                <div className={styles.fileName}>{getDisplayFileName(selectedItem)}</div>
              </>
            ) : (
              <div className={styles.previewEmpty}>
                {t('MultiImagesUpload.modal.selectImageToPreview')}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button icon={<Upload size={16} />} onClick={handleUpload} type="default">
            {t('MultiImagesUpload.modal.upload')}
          </Button>

          <Button onClick={handleComplete} type="primary">
            {t('MultiImagesUpload.modal.complete')}
          </Button>
        </div>
      </Modal>
    );
  },
);

ImageManageModal.displayName = 'ImageManageModal';

export default ImageManageModal;
